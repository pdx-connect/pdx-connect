import {Express, Request, NextFunction} from "express";
import {Connection, ReplSet} from "typeorm";
import * as expressWs from "express-ws";
import * as ws from "ws";
import {User} from "../entity/User";
import {ConversationParticipant} from "../entity/ConversationParticipant";
import {Message} from "../entity/Message";
import { Conversation } from "../entity/Conversation";

export function route(app: Express, db: Connection) {
    const appWS: expressWs.Application = expressWs(app).app;
    let connections: {
        socket: ws,
        user: number
    }[] = [];

    appWS.ws("/", (socket: ws, req: Request, next: NextFunction) => {
        if ( typeof req.user == null) {
            // TODO send error
            return;
        }
        const user: User = req.user;
        socket.onopen = () => {
            // Add the connection
            connections.push({
                socket: socket,
                user: user.id
            })
            // Define event handlers
            socket.on("message", async (msg: ws.Data) => {
                if (typeof msg != "string" ) {
                    socket.close();
                    return;
                }
                let message = JSON.parse(msg);
                let type: string = message.type;
                let conversationID: number = message.conversationID;

                if ( type == null || conversationID == null ) {
                        // TODO send an error
                        return;
                }
                // Handle message type cases
                if ( type == "seen") {
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
                    // If message type is "message", add message to database and transmit to participants
                    if ( typeof message.content != "string" ) {
                        // TODO send error
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
                    // Look up conversation
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
                    // Find all participants in conversation
                    let participants: ConversationParticipant[] = await ConversationParticipant.find({
                        where: {
                            conversationID: conversation.id
                        }
                    });
                    // Find connections to all logged-on participants
                    for( let i = 0; i < participants.length; ++i ) {
                        for ( let j = 0; j < connections.length; ++j ) {
                            if ( connections[j].user == participants[i].userID ) {

                            }
                        }
                    }
                    // Transmit to all logged on participants
        
                }
                else {
                    // TODO send an error
                    return;
                }
                return;
            });
            socket.onerror = () => {
                // TODO Maybe also send error
                socket.close();
                return;
            };
            socket.onclose = () => {
                // Remove from list of active connections
                connections.filter( (value, index, arr) => {
                    return value == {
                        socket: socket,
                        user: user.id
                    }
                })
                return;
            };
        };
    });
}