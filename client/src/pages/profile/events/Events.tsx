import * as React from "react";
import {Component, ReactNode} from "react";

interface Props {
}

interface SubState {
}

interface State extends SubState {
}


/**
 * 
 */
export class Events extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    public render(): ReactNode {
        
        return (
            <pre>events</pre>
        );
    }

}