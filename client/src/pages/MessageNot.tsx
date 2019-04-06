import * as React from "react";
import {Component, ReactNode} from "react";


interface Props {
    Message: String;
}

interface State {
    Message: String;
}

/**
 * 
 */
export class MessageNotification extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            Message: props.Message
        };
    }

  
    
    /**
     * @override
     */
    public render(): ReactNode {

        return (
                <h1>{this.state.Message}</h1>
        );
    }

}