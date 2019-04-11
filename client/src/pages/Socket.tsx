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

        /**
     * @override
     */
    public componentDidMount() {
        //this.socket = new WebSocket("ws://localhost:9999");
        
        // Get unread messages from before user was connected
        this.getUnreadMessages();
    };

    private readonly getUnreadMessages = async () => {
        const response: Response = await fetch("/api/messages/backlog", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if(data.length == null) {
            console.log("error in getUnreadMessages")
            return;
        }

        const conversations = this.processData(data);
        if(conversations != undefined) {
            this.setState({messages: conversations});
        }
            
    };
    
    private readonly processData = (data: []) => {
        let conversations: ConversationEntry[] = [];

        for (let i = 0; i < data.length; ++i) {
            
            // Enforce types before moving on
            if(typeof data[i] !== "object") {
                console.log("error in processData")
                return;
            }


            let conversationID: number | null = null;
            if (data[i] != null) {
                if('converstationID' in data[i]) {
                    console.log(data[i]['conversationID']);
                    let conversationID = data[i]['converstationID'];
                }
            }

           let lastSeen: number | null = null;
           if (data[i] != null) {
               if('lastSeen' in data[i]) {
                   console.log(data[i]['lastSeen']);
                   let lastSeen = data[i]['lastSeen'];
               }
           }

           let messages: ServerMessage[]| null = null;
           if (data[i] != null) {
               if('messages' in data[i]) {
                   console.log(data[i]['messages']);
                   let messages = data[i]['messages'];
               }
           }

            if (conversationID == null || lastSeen == null || messages == null) {
               console.log("error in processData");
                return;
            }

            // Add the conversaion
            conversations.push({
                conversationID: conversationID,
                lastSeen: lastSeen,
                entries: this.convertMessages(messages, lastSeen)
            });
        }

        return conversations;
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

        return (<div>Socket: {this.state.messages}</div>);
    }

}
