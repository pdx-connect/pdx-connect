import * as React from "react";
import {Component, ReactNode} from "react";


interface ServerMessage {
    from: number;
    timeSent: number;
    content: string;
}

export interface Message {
    userID: number;
    timeSent: number;
    text: string;
    seen: boolean;
}

export interface ConversationEntry {
    conversationID: number;
    lastSeen: number;
    entries: Message[];
}

interface State {
    messages: ConversationEntry[];
    alerts: object;
    messageCount: number;
    notificationCount: number;
}

interface Props {
}

/**
 *
 */
export class Socket extends Component<Props, State> {

    private socket: WebSocket|null = null;
    
    constructor(props: Props) {
        super(props);
        this.state = {
            messages: [],
            alerts: {},
            messageCount: 0, 
            notificationCount: 0,
        };
    }

    private readonly getUnreadMessages = async () => {
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
            const lastSeen: number = data[i].lastSeen;
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
        this.setState({messages: conversations});
        console.log(conversations);
    };

    // Get more messages for a particular conversation, update messages state elemtn
    private readonly getMoreMessages = async (conversationID: number) => {
        let conversation: ConversationEntry;
        let alreadyHave: number = 0;
        let lastSeen: number = 0;
    
        // Search for the conversation, get the number of existing messages
        for (let i = 0; i < this.state.messages.length; ++i) {
            if (this.state.messages[i].conversationID == conversationID) {
                alreadyHave = this.state.messages[i].entries.length;
                lastSeen = this.state.messages[i].lastSeen;
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

    private readonly convertMessages = (messages: ServerMessage[], lastSeen: number) => {
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
        let tempMessages: ConversationEntry[] = this.state.messages;
        let length = tempMessages.length;
        let foundAt = -1;

        // See whether an entry for the conversation exists exists
        for(let i = 0; i < length; ++i) {
            if (tempMessages[i].conversationID == newMessages.conversationID) {
                foundAt = i;
                break;
            }
        }
        // If the user entry exists, add the messages
        if (foundAt >= 0) {
            length = newMessages.entries.length;
            for(let i = length-1; i <= 0; --i) {
                // Ignore messages which are already in the log
                if ( newMessages.entries[i].timeSent < tempMessages[foundAt].entries[0].timeSent ) {
                    continue;
                } else if ( newMessages.entries[i].timeSent == tempMessages[foundAt].entries[0].timeSent 
                            &&  newMessages.entries[i].userID == tempMessages[foundAt].entries[0].userID 
                            &&  newMessages.entries[i].text == tempMessages[foundAt].entries[0].text ) {
                    continue;
                } else { 
                    tempMessages[foundAt].entries.unshift(newMessages.entries[i])
                }
            }
        }
        // Otherwise just append UserEntry object
        else {
            tempMessages.push(newMessages);
        }
        // Update the state of the this component
        this.setState({messages: tempMessages});
    };

        // Send a message to the server, insert it into our message log
    private readonly sendMessage = (conversationID: number, msg: string) => {
        let tempMessages: ConversationEntry[] = this.state.messages;
        let found = false;
        if (this.socket == null) {
            // TODO send error
            console.log("error in sendMessage");
            return;
        }
        // Send the message as a string
        this.socket.send(JSON.stringify({
            type: "message", 
            conversationID: conversationID,
            content: msg
        }));
        // Search the messages log, find the conversation, add the message
        for (let i = 0; i < tempMessages.length; ++i) {
            if (tempMessages[i].conversationID == conversationID) {
                tempMessages[i].entries.unshift({
                    userID: 0, // !!! TODO get userID
                    timeSent: Date.now(),
                    text: msg,
                    seen: true
                });
                break;
            }
        }
        this.setState({messages: tempMessages});
    };

    private readonly seenRecent = (conversationID: number, time: number) => {
        // TODO write the function
        return;
    };

    /**
     * @override
     */
    public componentDidMount() {
        this.socket = new WebSocket("ws://localhost:9999");
        // Get unread messages from before we were connected
        this.getUnreadMessages();

        // Establish behavior of connection
        this.socket.onopen = () => {
            // When a message is received, do...
            if( this.socket != null ) { // TODO: this check is a hacky work around
                this.socket.onmessage = (msg: MessageEvent) => {
                    let toAdd: ConversationEntry;
                    let message: Message;
                    let data = msg.data;
                    if (typeof data !== "object") {
                        // TODO throw an error
                        console.log("error in socket.onmessage");
                        return;
                    }
                    data = JSON.parse(data);
                    let lastSeen: number = 0;
                    let conversationID: number = data.conversationID;
                    let msgFromServer: ServerMessage = data.message;
                    if (conversationID == null || msgFromServer == null) {
                        // TODO throw an error
                        console.log("error in socket.onmessage")
                        return;
                    }
                    message = {
                        userID: msgFromServer.from,
                        timeSent: msgFromServer.timeSent,
                        text: msgFromServer.content,
                        seen: false,
                    }
                    for (let i = 0; i < this.state.messages.length; ++i) {
                        if (this.state.messages[i].conversationID == conversationID ){
                            lastSeen = this.state.messages[i].lastSeen;
                            break;
                        }
                    }
                    toAdd = {
                        conversationID: conversationID,
                        lastSeen: lastSeen,
                        entries: [message]
                    }
                };
                this.socket.onerror = (error) => {
                };
                this.socket.onclose = (closed) => {
                };
            }
        };
    };

    /**
     * @override
     */
    public componentWillUnmount() {
        if(this.socket != null) {
            this.socket.close();
        }
    }

    /***
     * @override
     */
    public render(): ReactNode {
        console.log(this.state.messages);
        return null;
    }
}
