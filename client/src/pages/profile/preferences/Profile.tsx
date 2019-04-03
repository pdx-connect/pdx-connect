import * as React from "react";
import {Component} from "react";

interface Props {
}

export class Profile extends Component<Props, any> {
    
    /**
     * @override
     */
    public render() {

        return (
            <p>
                Toggle profile visibility. <br></br>
                <b>On:</b> Profile is public. <br></br>
                <b>Off:</b> Profile is private.
            </p>
        );
    }

}
