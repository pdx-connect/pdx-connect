import * as React from "react";
import {Component, ReactNode} from "react";


interface ServerMessage {
    from: number;
    timeSent: Date;
    content: string;
}

export interface Message {
    userID: number;
    timeSent: Date;
    text: string;
    seen: boolean;
}

export interface ConversationEntry {
    conversationID: number;
    lastSeen: Date;
    entries: Message[];
}

/**
 *
 */
export class Socket {

    private socket: WebSocket|null = null;
    private messages: ConversationEntry[];
    private updateMessages: (messages: ConversationEntry[]) => void;

    
    constructor(updateMessages: (messages: ConversationEntry[]) => void) {
        this.messages = [];
        this.updateMessages = updateMessages;

        this.socket = new WebSocket("ws://localhost:9999");
        // Get unread messages from before we were connected
        //this.getUnreadMessages();
        //Put in Home
        
        // Establish behavior of connection 
        this.socket.onopen = () => {
            // When a message is received, do...
            if( this.socket != null ) { // TODO: this check is a hacky work around
                this.socket.onmessage = (msg: MessageEvent) => {
                    console.log("On message triggered")
                    let conversation: ConversationEntry;
                    let message: Message;
                    let data = msg.data;
                    console.log(data);
                    if (typeof data !== "string") {
                        // TODO throw an error
                        console.log("error in socket.onmessage - data not object");
                        return;
                    }
                    data = JSON.parse(data);
                    console.log("Data:", data);
                    let lastSeen: Date = new Date();
                    let conversationID: number = data.conversationID;
                    let msgFromServer: ServerMessage = data.message;
                    if (conversationID == null || msgFromServer == null) {
                        // TODO throw an error
                        console.log("error in socket.onmessage - message fields bads")
                        return;
                    }
                    message = {
                        userID: msgFromServer.from,
                        timeSent: msgFromServer.timeSent,
                        text: msgFromServer.content,
                        seen: false,
                    }
                    for (let i = 0; i < this.messages.length; ++i) {
                        if (this.messages[i].conversationID == conversationID ){
                            lastSeen = this.messages[i].lastSeen;
                            break;
                        }
                    }
                    conversation = {
                        conversationID: conversationID,
                        lastSeen: lastSeen,
                        entries: [message]
                    }
                    this.addToConversation(conversation);
                };
                this.socket.onerror = (error) => {
                };
                this.socket.onclose = (closed) => {
                    console.log("Connection Closed");
                };
            }
        };
    }

    public readonly getUnreadMessages = async () => {
        let conversations: ConversationEntry[] = [];

        const response: Response = await fetch("/api/messages/backlog", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if(data.length == null) {
            // TODO throw an error 

            console.log("error in getUnreadMessages")
            return;
        }
        // For each conversation returned, put it in the messages element
        for (let i = 0; i < data.length; ++i) {
            // Enforce types before moving on
            if(typeof data[i] !== "object") {
                // TODO throw an error
                console.log("error in getUnreadMessages")
                return;
            }
            const conversationID: number = data[i].conversationID;
            const lastSeen: Date = data[i].lastSeen;
            const messages: ServerMessage[] = data[i].messages;
            if (conversationID == null || lastSeen == null || messages == null) {
                // TODO throw error
                console.log("error in getUnreadMesasages");
                return;
            }
            // Add the conversaion
            conversations.push({
                conversationID: conversationID,
                lastSeen: lastSeen,
                entries: this.convertMessages(messages, lastSeen)
            });
        }
        // Update messages, this should force rerender to components which use messages
        this.messages = conversations;
        this.updateMessages(this.messages);
    };

    // Get more messages for a particular conversation, update messages state elemtn
    public readonly getMoreMessages = async (conversationID: number) => {
        let conversation: ConversationEntry;
        let alreadyHave: number = 0;
        let lastSeen: Date = new Date();
    
        // Search for the conversation, get the number of existing messages
        for (let i = 0; i < this.messages.length; ++i) {
            if (this.messages[i].conversationID == conversationID) {
                alreadyHave = this.messages[i].entries.length;
                lastSeen = this.messages[i].lastSeen;
                break;
            }
        }
        // Get the messages from the server
        const response: Response = await fetch("/api/messages/more", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversationID: conversationID,
                alreadyHave: alreadyHave,
            })
        });
        // Turn the response into a ConversationEntry
        const data = await response.json();
        if (data == null) {
            // TODO throw an error
            console.log("error in getMoreMessages");
            return;
        }
        let messages: ServerMessage[] = data;
        if (messages == null) {
            // TODO throw an error
            console.log("error in getMoreMessages");
            throw new Error();
        }
        conversation = {
            conversationID: conversationID,
            lastSeen: lastSeen, 
            entries: this.convertMessages(messages, lastSeen)
        };
        this.addToConversation(conversation);
    };

    private readonly convertMessages = (messages: ServerMessage[], lastSeen: Date) => {
        let toReturn: Message[] = [];

        for(let i = 0; i < messages.length; ++i) {
            // TODO Unsure whether to use checks or enforce types in the argument list
            toReturn.push({
                userID: messages[i].from,
                timeSent: messages[i].timeSent,
                text: messages[i].content,
                seen: true ? messages[i].timeSent < lastSeen : false
            });
        }
        return toReturn;
    };

    // Update the messages state element to include new messages
    private readonly addToConversation = (newMessages: ConversationEntry) => {
        let tempMessages: ConversationEntry[] = this.messages;
        let foundAt = -1;

        // See whether an entry for the conversation exists exists
        for(let i = 0; i < tempMessages.length; ++i) {
            if (tempMessages[i].conversationID == newMessages.conversationID) {
                foundAt = i;
                break;
            }
        }
        console.log("Found at index: ", foundAt);
        // If the user entry exists, add the messages
        if (foundAt >= 0) {
            for(let i = newMessages.entries.length-1; i >= 0; --i) {
                // Ignore messages which are already in the log
                // console.log("New messages length: ", newMessages.entries.length);
                // console.log("Temp messages length: ", tempMessages[foundAt].entries.length);
                // console.log("Indexing new messaged with: ", i);
                if (tempMessages[foundAt].entries.length == 0) {
                    console.log("No messages found");
                    tempMessages[foundAt].entries.unshift(newMessages.entries[i]);
                } else if ( newMessages.entries[i].timeSent < tempMessages[foundAt].entries[0].timeSent ) {
                    console.log("Message timestamp overlap");
                    continue;
                } else if ( newMessages.entries[i].timeSent == tempMessages[foundAt].entries[0].timeSent 
                            &&  newMessages.entries[i].userID == tempMessages[foundAt].entries[0].userID 
                            &&  newMessages.entries[i].text == tempMessages[foundAt].entries[0].text ) {
                    console.log("Message the same");
                    continue;
                } else { 
                    console.log("Message added to conversation");
                    tempMessages[foundAt].entries.unshift(newMessages.entries[i])
                }
            }
        }
        // Otherwise just append UserEntry object
        else {
            tempMessages.push(newMessages);
        }
        // Update the state of the this component
        this.messages = tempMessages;
        this.updateMessages(this.messages);
    };

        // Send a message to the server, insert it into our message log
    public readonly sendMessage = (msg: string, conversationID: number|null, userID:number[]|null) => {
        let tempMessages: ConversationEntry[] = this.messages;
        let found = false;
        if (this.socket == null) {
            // TODO send error
            console.log("error in sendMessage");
            return;
        }
        // If the conversation does not exist, request a new conversation
        if (conversationID == null) {
            if (userID == null) {
                //TODO throw error
                return;
            }
            // Get a conversationID from the server
            this.socket.send(JSON.stringify({
                type: "new",
                userID: userID,
                content: msg
            }));
            // If the conversation does exist..
        } else {
            console.log("Right before message send")
            console.log(msg);    
            this.socket.send(JSON.stringify({
            type: "message",
            conversationID: conversationID,
            content: msg
            }));
        }
    };

    public readonly getParticipants = async (conversationID: number) => {
        const response: Response = await fetch("/api/messages/participants", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({conversationID: conversationID})
        });
        const data: {
            userID: number;
            displayName: string;
        }[] = await response.json();
        if(data.length == null) {
            // TODO throw an error 

            console.log("error in getUnreadMessages")
            return;
        }
        let participants: Map<number,string> = new Map();
        for (let i = 0; i < data.length; ++i) {
            participants.set(data[i].userID, data[i].displayName);
        }
        return participants;
    };

    public readonly seenRecent = (conversationID: number, time: Date) => {
        // Verify socket
        if (this.socket == null) {
            // TODO throw an error?
            console.log("Failed in seenRecent - socket is null")
            return;
        }
        // Update the local log of messages
        let tempMessages: ConversationEntry[] = this.messages;
        let found = false;
        for (let i = 0; i < tempMessages.length; ++i) {
            if (tempMessages[i].conversationID == conversationID) {
                found = true;
                tempMessages[i].lastSeen = time;
                for (let j = 0; j < tempMessages[i].entries.length; ++j) {
                    if (tempMessages[i].entries[j].timeSent < time) {
                        tempMessages[i].entries[j].seen = true;
                    }
                }
            }
        }
        
        if (!found) {
            // TODO throw an error?
            console.log("Tried to indicate conversation is seen when conversation is not loaded");
            return;
        }
        // Send the message to the server
        this.socket.send(JSON.stringify({
            type: "seen",
            conversationID: conversationID, 
            content: time
        }));
    };
}