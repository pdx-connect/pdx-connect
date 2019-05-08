import {Express, Request, NextFunction, response} from "express";
import {Connection, ReplSet} from "typeorm";
import * as expressWs from "express-ws";
import * as ws from "ws";
import {User} from "../entity/User";
import {ConversationParticipant} from "../entity/ConversationParticipant";
import {Message} from "../entity/Message";
import { Conversation } from "../entity/Conversation";

class connectionsWrapper {
    static connections: {
        socket: ws,
        user: number
    }[];

    constructor () {
        if (connectionsWrapper.connections == null) {
            connectionsWrapper.connections = [];
        }
    }

    public readonly push = (conn: {socket: ws, user: number}) => {
        connectionsWrapper.connections.push(conn);
    }

    public readonly length = () => {
        return connectionsWrapper.connections.length;
    }

    public readonly index = (i: number) => {
        return connectionsWrapper.connections[i];
    }
}

export function route(app: Express, db: Connection) {
    const appWS: expressWs.Application = expressWs(app).app;
    let cw = new connectionsWrapper();

    appWS.ws("/", (socket: ws, req: Request, next: NextFunction) => {
        if ( typeof req.user == null) {
            // TODO send error
            return;
        }
        const user: User = req.user;
        if (user == null) {
            console.log("Closing due to invalid user id")
            socket.close();
            return;
        }
        // Add the connection
        cw.push({
            socket: socket,
            user: user.id
        })

        // Define event handlers
        socket.on("message", async (msg: ws.Data) => {
            // Validate message type and structure
            if (typeof msg != "string" ) {
                console.log("Closing because message not string")
                socket.close();
                return;
            }
            let message = JSON.parse(msg);
            let type: string = message.type;
            let conversationID: number = message.conversationID;
            if ( type == null ) {
                    // TODO send an error
                    console.log("Type null")
                    return;
            }
            // Handle message type cases
            if ( type == "seen") {
                // Ensure conversationID exists
                if (conversationID == null) {
                    // TODO send an error
                    console.log("ConversationID null");
                    return;
                }
                if ( typeof message.content != "number" ) {
                    // TODO send error
                    return;
                }
                // If message type is "seen", update conversationParticipant entry
                let conversationIn: ConversationParticipant|undefined = await ConversationParticipant.findOne({
                    where: {
                        conversationID: conversationID,
                        userID: user.id
                    }
                });
                if( conversationIn == null ) {
                    // TODO send error
                    return;
                }
                let timeSeen: Date = new Date(Date.parse(message.content));
                conversationIn.lastSeen = timeSeen;
                conversationIn.save();
                return;
            } else if (type == "message") {
                // Ensure conversationID exists
                if (conversationID == null) {
                    // TODO send an error
                    console.log("ConversationID null");
                    return;
                }
                // If message type is "message", add message to database and transmit to participants
                if ( typeof message.content != "string" ) {
                    // TODO send error
                    console.log("No content");
                    return;
                }
                let conversationIn: ConversationParticipant|undefined = await ConversationParticipant.findOne({
                    where: {
                        conversationID: conversationID, 
                        userID: user.id
                    }
                });
                if ( conversationIn == null ) {
                    // TODO send error
                    return;
                }
                // Look up conversation, needed for message constructor
                let conversation: Conversation|undefined = await Conversation.findOne({
                    where: {
                        id: conversationIn.conversationID
                    }
                });
                if ( conversation == null ) {
                    // TODO send error
                    return;
                }
                // Make the message and save it to the database
                let newMessage = new Message(conversation, user, message.content);
                newMessage.save();
                // Find all participants in conversation
                let participants: ConversationParticipant[] = await ConversationParticipant.find({
                    where: {
                        conversationID: conversation.id
                    }
                });
                // Find connections to all logged-on participants
                for( let i = 0; i < participants.length; ++i ) {
                    for ( let j = 0; j < cw.length(); ++j ) {
                        // If this connection matches a participant, and isn't the sender..
                        if (cw.index(j).user == participants[i].userID) {
                            try{
                                cw.index(j).socket.send(JSON.stringify({
                                    conversationID: conversationID,
                                    message: {
                                        from: newMessage.userID,
                                        timeSent: newMessage.timeSent,
                                        content: newMessage.content
                                    }
                                }));
                            } catch {
                                cw.index(j).socket.close();
                            }
                        }
                    }
                }
                // Transmit to all logged on participants
    
            } else if (type == "new") {
                // Ensure conversationID exists
                let peopleInConvo: number[] = message.userID;
                if (peopleInConvo == null) {
                    // TODO send an error
                    console.log("UserIDs null"); 
                    return;
                }
                // If the conversation is between two people, try to find a duplicate conversation
                if (peopleInConvo.length == 2) {
                    // Find the other user's ID
                    let targetUser = peopleInConvo[0] ? peopleInConvo[0] != user.id : peopleInConvo[1];
                    // Get this users conversations participant entities
                    const myConversationParticipation: ConversationParticipant[] = await ConversationParticipant.find({
                        where: {
                            userID: user.id
                        }
                    });
                    // For each conversation participantion, get the conversation, check the number of particpants, 
                    // and (if the number is two and the second participant is the targe), return the conversationID
                    for (let i = 0; i < myConversationParticipation.length; ++i) {
                        let conversation: Conversation = await myConversationParticipation[i].conversation;
                        if (conversation == null) {
                            continue;
                        }
                        let fromConversation: ConversationParticipant[] = await conversation.participants;
                        if (fromConversation == null) {
                            continue;
                        }
                        // If the conversation is between two people..
                        if (fromConversation.length == 2) {
                            for (let j = 0; j < 2; ++j) {
                                //.. and the two people are the user and the target, return the conversationID
                                if (fromConversation[j].userID == targetUser) {
                                    socket.send(JSON.stringify({conversationID:conversation.id}));
                                    return;
                                }
                            }
                        }
                    }
                }
                // If the conversation exists, get ID, 
                // Otherwise create a new conversation and conversation participants
                const conversation: Conversation = new Conversation();
                const participants: ConversationParticipant[] = [];
                // Create/save the message
                let newMessage = new Message(conversation, user, message.content);
                newMessage.save();

                // Send the message to every participant
                for (let i = 0; i < participants.length; ++i) {
                    for (let j = 0; j < cw.length(); ++j) {
                        if (cw.index(j).user == participants[i].userID) {
                            try {
                                cw.index(j).socket.send(JSON.stringify({
                                    conversationID: conversationID,
                                    message: {
                                        from: newMessage.userID,
                                        timeSend: newMessage.timeSent,
                                        content: newMessage.content,
                                    }
                                }));
                            } catch {
                                cw.index(j).socket.close();
                            }
                        }
                    }
                }
            }
            else {
                // TODO send an error
                return;
            }
            return;
        });
        // On error
        socket.on("error", (error) => {
            // TODO maybe send error?
            console.log("Closing because of socket error")
            socket.close();
            return;
        });
        // on Close
        socket.on("close", () => {
            // Remove from list of active connections
            connectionsWrapper.connections = connectionsWrapper.connections.filter( (value, index, arr) => {
                return value.socket == socket && value.user == user.id;
            })
            console.log("Connection closing for some reason")
            return;
        });
    });
}