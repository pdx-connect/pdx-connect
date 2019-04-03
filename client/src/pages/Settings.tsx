import * as React from "react";
import {Component, ReactNode} from "react";


interface Props {
}

interface State {
}

/**
 * 
 */
export class Settings extends Component<Props, State> {
    
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
                <pre>This is the settings page</pre>
        );
    }

}