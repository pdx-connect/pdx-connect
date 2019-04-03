import * as React from "react";
import {Component} from "react";

interface Props {
}

export class Miscellaneous extends Component<Props, any> {
    
    /**
     * @override
     */
    public render() {

        return (
            <p>
            Toggles notifications. <br></br>
            <b>On:</b> You will receive notifications. This can be customized to your own needs. <br></br>
            <b>Off:</b> You will not receive notifications.
            Receive email notifications for other notification from PDX Connect.<br></br>
            <b>On:</b> You <span className='strong'>will</span> receive email notifications <br></br>
            <b>Off:</b> You <span className='strong'>will not</span> receive email notifications
        </p>
        );
    }

}
