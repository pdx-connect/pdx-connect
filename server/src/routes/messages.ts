import {Express, Request, Response} from "express";
import {Connection, Not, LessThanOrEqual} from "typeorm";
import { User } from "../entity/User";
import { ConversationParticipant } from "../entity/ConversationParticipant";
import { Message} from "../entity/Message";


async function getMessages (conversations: ConversationParticipant[]) {
    // For every conversation, find the messages, pack them up
    // and put them in messagesToSend
    const conversationsToSend: {}[] = [];

    for (let i = 0; i < conversations.length; ++i) {
        let packed: {}[] = [];
        let messages: Message[] = await Message.find({
            where: {
                conversationID: conversations[i].conversationID
            }, 
            order: {
                timeSent: "DESC"
            },
            take: 30
        });
        // Process the messages and pack them up for addition to messagesToSend
        for (let j = 0; j < messages.length; ++i) {
            packed.push({
                from: messages[j].userID,
                timeSent: messages[j].timeSent,
                content: messages[j].content
            })
        }
        conversationsToSend.push({
            conversationID: conversations[i].conversationID,
            lastSeen: conversations[i].lastSeen,
            message: messages 
        });
    }
    return conversationsToSend;
}

export function route(app: Express, db: Connection) {
    app.post("/messages/backlog", async (request: Request, response: Response) => {
        if (typeof request.user == null) {
            // TODO send error
            return;
        }
        const user: User = request.user;
        const conversations: ConversationParticipant[] = await ConversationParticipant.find({
            where: {
                userID: user.id
            }
        });
        const messages: {}[] = await getMessages(conversations);
        response.send(JSON.stringify(messages));
    });

    app.post("/messages/more", async (request: Request, response: Response) => {
        if (typeof request.user == null) {
            // TODO send error
            return;
        } else if (typeof request.body !== "object") {
            response.sendStatus(400); // HTTP 400: Bad client request
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
                userID: user.id
            }
        });
        // If no entry is found...
        if (conversationEntry == null) {
            response.sendStatus(400); // HTTP 400: Bad client request
            return;
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
        // Pack them up and ship them off
        let toSend: {}[] = [];
        for( let i = 0; i < messages.length; ++i) {
            toSend.push({
                from: messages[i].userID,
                timeSent: messages[i].timeSent,
                content: messages[i].content
            });
        }
        response.send(JSON.stringify(toSend));
    });
}
