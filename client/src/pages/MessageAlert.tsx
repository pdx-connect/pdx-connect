import * as React from "react";
import {Component, ReactNode} from "react";
import {Message, UserEntry} from "./Home";


interface Props {
    messages: UserEntry[];
}

interface State {
    messages: UserEntry[];
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