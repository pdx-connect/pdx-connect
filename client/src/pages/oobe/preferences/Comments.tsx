import * as React from "react";
import {Component} from "react";

interface Props {
}

export class Comments extends Component<Props, any> {
    
    /**
     * @override
     */
    public render() {

        return (
            <p>
            Receive email notifications for comments on your posts and replies to your comments.<br></br>
            <b>On:</b> You <span className='strong'>will</span> receive email notifications <br></br>
            <b>Off:</b> You <span className='strong'>will not</span> receive email notifications
        </p>
        );
    }

}
