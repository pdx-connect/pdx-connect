import * as React from "react";
import {Component} from "react";

interface Props {
}

export class Tags extends Component<Props, any> {
    
    /**
     * @override
     */
    public render() {

        return (
            <p>
                Allow tags to be set? <br></br>
                <b>On:</b> You can set tags on your posts or other users' posts. <br></br>
                <b>Off:</b> Disable tags.
            </p>
        );
    }

}
