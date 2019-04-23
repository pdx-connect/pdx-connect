import * as React from "react";
import {Component, ReactNode} from "react";
import {ConversationEntry} from "../Home";


interface Props {
    sendMessage: (msg: string, conversationID: number|null, userID: number[]|null) => void;
    getMoreMessages: (conversationID: number) => void;
    seenRecent: (conversationID: number, time: number) => void;
    conversations: ConversationEntry[];
    newMessageCount: number;
}

interface State {
}

/**
 * 
 */
export class Inbox extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

  
    
    /**
     * @override
     */
    public render(): ReactNode {

        return (
                <pre>This is the inbox page</pre>
        );
    }

}