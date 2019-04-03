import * as React from "react";
import {Component} from "react";

interface Props {
}

export class Messages extends Component<Props, any> {
    
    /**
     * @override
     */
    public render() {

        return (
            <p>
            Receive email notifications for messages from other users.<br></br>
            <b>On:</b> You <span className='strong'>will</span> receive email notifications <br></br>
            <b>Off:</b> You <span className='strong'>will not</span> receive email notifications
        </p>
        );
    }

}
