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
        console.log("Connection added to cw: ", conn);
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
            let userIDs: number[] = message.userIDs;
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
                await conversationIn.save();
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
                await newMessage.save();
                // Find all participants in conversation
                let participants: ConversationParticipant[] = await ConversationParticipant.find({
                    where: {
                        conversationID: conversation.id
                    }
                });
                // Find connections to all logged-on participants
                console.log("Trying to send the message...");
                for( let i = 0; i < participants.length; ++i ) {
                    for ( let j = 0; j < cw.length(); ++j ) {
                        // If this connection matches a participant, send the message
                        if (cw.index(j).user == participants[i].userID) {
                            console.log("Found a socket for this conversation");
                            try{
                                cw.index(j).socket.send(JSON.stringify({
                                    conversationID: conversation.id,
                                    message: {
                                        from: newMessage.userID,
                                        timeSent: newMessage.timeSent,
                                        content: newMessage.content
                                    }
                                }));
                            } catch {
                                console.log("Threw an error trying to send the message");
                                cw.index(j).socket.close();
                            }
                        } else {
                            console.log("Found a socket which did not belong to the conversation");
                        }
                    }
                }
                // Transmit to all logged on participants
    
            } else if (type == "new") {
                // Define variables for later use
                let conversation: Conversation|undefined;
                let participants: ConversationParticipant[] = [];
                let makeNew: boolean = true;
                // Ensure userIDs exist
                if (userIDs == null) {
                    // TODO send an error
                    console.log("UserIDs null"); 
                    return;
                }
                // Ensure that this user is in the userIDs 
                let found = false;
                for (let i = 0; i < userIDs.length; ++i) {
                    if (userIDs[i] == user.id) {
                        found = true;
                    }
                }
                if (found == false) {
                    //TODO throw an error
                    return;
                }
                // If the conversation is between two people, try to find a duplicate conversation
                if (userIDs.length == 2) {
                    // Find the other user's ID
                    let targetUser = userIDs[0] ? userIDs[0] != user.id : userIDs[1];
                    // Get this users conversations participant entities
                    const myConversationParticipation: ConversationParticipant[] = await ConversationParticipant.find({
                        where: {
                            userID: user.id
                        }
                    });
                    // For each conversation participantion, get the conversation, check the number of particpants, 
                    // and (if the number is two and the second participant is the targe), return the conversationID
                    for (let i = 0; i < myConversationParticipation.length; ++i) {
                        conversation = await myConversationParticipation[i].conversation;
                        if (conversation == null) {
                            continue;
                        }
                        participants = await conversation.participants;
                        if (participants == null) {
                            continue;
                        }
                        // If the conversation is between two people..
                        if (participants.length == 2) {
                            for (let j = 0; j < 2; ++j) {
                                //.. and the two people are the user and the target, skip the make conversation step
                                if (participants[j].userID == targetUser) {
                                    makeNew = false;
                                }
                            }
                        }
                    }
                } 
                if (makeNew) {
                    // Otherwise create a new conversation and conversation participants
                    conversation = await new Conversation().save();
                    for (let i = 0; i < userIDs.length; ++i) {
                        console.error("finding participant");
                        let thisUser: User|undefined = await User.findOne({
                            where: {
                                id: userIDs[i]
                            }
                        });
                        if (thisUser != null) {
                            console.error("creating ConversationParticipant entity");
                            let newParticipant = new ConversationParticipant(conversation, thisUser);
                            await newParticipant.save();
                            participants.push(newParticipant);
                        }
                    }
                }
                // Create/save the message
                if (conversation != null) {
                    let newMessage = new Message(conversation, user, message.content);
                    await newMessage.save();
                    // Send the message to every participant
                    console.log("Trying to send the message...");
                    for (let i = 0; i < participants.length; ++i) {
                        for (let j = 0; j < cw.length(); ++j) {
                            if (cw.index(j).user == participants[i].userID) {
                                console.log("Found a socket for this conversation");
                                try {
                                    cw.index(j).socket.send(JSON.stringify({
                                        conversationID: conversation.id,
                                        message: {
                                            from: newMessage.userID,
                                            timeSent: newMessage.timeSent,
                                            content: newMessage.content,
                                        }
                                    }));
                                } catch {
                                    console.log("Threw an error trying to send the message");
                                    cw.index(j).socket.close();
                                }
                            } else {
                                console.log("Found a socket which did not belong to the conversation");
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
            console.log("Removing connection, before: ", connectionsWrapper.connections);
            connectionsWrapper.connections = connectionsWrapper.connections.filter( (value, index, arr) => {
                return value.socket == socket && value.user == user.id;
            })
            console.log("Removing connection, after: ", connectionsWrapper.connections);
            console.log("Connection closing for some reason")
            return;
        });
    });
}