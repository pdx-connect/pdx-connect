import * as React from "react";
import {Component, ReactNode} from "react";
import {ConversationEntry} from "./Home";


interface Props {
    messages: ConversationEntry[];
}

interface State {
    messages: ConversationEntry[];
}

/**
 * 
 */
export class MessageAlert extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
    }
    
    /**
     * @override
     */
    public render(): ReactNode {
        return (
            <pre>Welcome to Message Alerts {this.props.messages}</pre>
        );
    }
    
}
