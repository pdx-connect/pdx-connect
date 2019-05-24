import {Express, Request, Response} from "express";
import {Connection, Not, LessThanOrEqual} from "typeorm";
import { User } from "../../entity/User";
import { ConversationParticipant } from "../../entity/ConversationParticipant";
import { Message} from "../../entity/Message";
import { Conversation } from "../../entity/Conversation";


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
        for (let j = 0; j < messages.length; ++j) {
            packed.push({
                from: messages[j].userID,
                timeSent: messages[j].timeSent,
                content: messages[j].content
            })
        }
        conversationsToSend.push({
            conversationID: conversations[i].conversationID,
            lastSeen: conversations[i].lastSeen,
            messages: packed
        });
    }
    return conversationsToSend;
}

export function route(app: Express, db: Connection) {
    app.get("/api/messages/backlog", async (request: Request, response: Response) => {
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

    app.get("/api/messages/start", async (request: Request, response, Response) => {
        if (typeof request.user == null) {
            // TODO send error
            return;
        }
        // Get the request information and validate format
        const user: User = request.user;
        if (typeof request.body !== "object") {
            response.sendStatus(400); // HTTP 400: Bad client request
            return;
        }
        const body: {userIDs: number[]} = request.body;
        if (body == null) {
            response.sendStatus(400); // HTTP 400: Bad client request
            return;
        }
        const userIDs: number[] = body.userIDs;
        // REMOVE THIS TO ENABLE GROUP CHATS
        if (userIDs.length > 1) {
            response.sendStatus(400); // HTTP 400: Bad client request
            return;            
        }
        // Check if the conversation needs to be created
        if (userIDs.length == 1) {
            // TODO look for conversation between user and userIDs[0]
            // TODO send an error
            return;
        }
        // Create the new conversation and participant entities, and save them
        let conversation = new Conversation();
        conversation.save();
        let thisParticipant = new ConversationParticipant(conversation, user);
        thisParticipant.save();
        for (let i = 0; i < userIDs.length; ++i) {
            let newUser: User|undefined = await User.findOne({
                where: {
                    userID: userIDs[i]
                }
            });
            if (newUser == null) {
                // TODO send an error
            } else {
                let newParticipant = new ConversationParticipant(conversation,newUser);
                newParticipant.save();
            }
        }
        // Send conversationID because to client
        response.send(JSON.stringify({
            conversationID: conversation.id
        }));
    });

    app.post("/api/messages/more", async (request: Request, response: Response) => {
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

    app.post("/api/messages/participants", async (request: Request, response: Response) => {
        // Verify that the request is valid
        if (typeof request.user == null) {
            // TODO send error
            return;
        } else if (typeof request.body !== "object") {
            response.sendStatus(400); // HTTP 400: Bad client request
            return;
        }
        // Get the user and body objects, validate fields
        const user: User = request.user;
        const body: any = request.body;
        if (typeof body.conversationID !== "number") {
            response.sendStatus(400); // HTTP 400: Bad client request
            return;
        }
        // Define array of userIDs and names to send as response
        let toSend: {
            userID: number;
            displayName: string;
        }[] = [];
        // Get the participants and save their IDs and names in toSend
        const participants: ConversationParticipant[] = await ConversationParticipant.find({
            where: {
                conversationID: body.conversationID
            }
        });
        for (let i = 0; i < participants.length; ++i) {
            let toAdd: User = await participants[i].user;
            toSend.push({
                userID: participants[i].userID,
                displayName: toAdd.displayName
            });
        }
        response.send(JSON.stringify(toSend));
    });
}
