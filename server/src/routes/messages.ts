import {Express, Request, Response} from "express";
import {Connection, Not, LessThanOrEqual} from "typeorm";
import { User } from "../entity/User";
import { ConversationParticipant } from "../entity/ConversationParticipant";
import { Message} from "../entity/Message";

export function route(app: Express, db: Connection) {
    app.post("/messages/backlog", async (request: Request, response: Response) => {
        const user: User = request.user;
        if (user != null) {
            const messagesToSend: {}[] = [];
            const conversations: ConversationParticipant[] = await ConversationParticipant.find({
                where: {
                    userID: user.id
                }
            });
            // For every conversation, find the unseen messages, pack them up
            // and put them in messagesToSend
            for (let i = 0; i < conversations.length; ++i) {
                let packed: {}[] = [];
                let messages: Message[] = await Message.find({
                    where: {
                        conversationID: conversations[i].conversationID,
                        timeSent: Not(LessThanOrEqual(conversations[i].lastSeen))
                    }
                });
                // Process the messages and pack them up for addition to messagesToSend
                for (let j = 0; j < messages.length; ++i) {
                    packed.push({
                        conversationID: messages[i].conversationID,
                        from: messages[i].userID,
                        timeSent: messages[i].timeSent,
                        content: messages[i].content
                    })
                }
                messagesToSend.push(packed);
            }
            response.send(JSON.stringify(messagesToSend));
        } else {
            // not logged in, send error and terminate
        }
    });
    app.post("/messages/more", async (request: Request, response: Response) => {
        if (typeof request.user == null) {
            // send logged in error and terminate
            return;
        } else if (typeof request.body !== "object") {
            // send improper message error and terminate
            return;
        }
        const user: User = request.user;
        const body: any = request.body;
        if (typeof body.conversationID !== "number" || 
            typeof body.alreadyHave !== "number") {
            response.sendStatus(400); // HTTP 400: Bad client request
            return;
        }
        const conversationID: number = body.conversationID;
        const alreadyHave: number = body.alreadyHave;
        // Find correct conversation
        let conversationEntry: ConversationParticipant | undefined = await ConversationParticipant.findOne({
            where: {
                conversationID: conversationID,
                user: user
            }
        });
        // If no entry is found...
        if (conversationEntry == null) {
            // Return error to client and terminate
        }
        // For with the conversation, get more messages, pack them up, send them
        let messages: Message[] = await Message.find({
            where: {
                conversationID: conversationID
            },
            order: {
                timeSent: "DESC"
            },
            skip: alreadyHave,
            take: 20
        });
        // TODO
    });
}
