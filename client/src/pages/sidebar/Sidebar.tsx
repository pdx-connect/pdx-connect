import * as React from "react";
import {Component, ReactNode} from "react";
import { FaHome, FaUser, FaCalendar, FaClipboard, FaMailBulk} from 'react-icons/fa';
import { slide as Menu } from 'react-burger-menu';
import {getJSON} from "../../util/json";

import "./Sidebar.css";


interface Props {
    displayName?: string;
    updateHistory: (value: string) => void,
}

interface State {
    picture: string;
}

/**
 * 
 */
export class Sidebar extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            picture: ""
        };
    }

        /**
     * @override
     */
    public async componentDidMount() {
        this.getUserProfilePicture().then(picture => {
            console.log('picture returned: ', picture);
            this.setState({
                picture: picture
            });
        });
    }

    private readonly getUserProfilePicture = async () => {
        const data = await getJSON("/api/user-profile/picture");
        return data.picture;
    };

    /**
     * @override
     */
    public render(): ReactNode {
        let displayName = this.props.displayName;
        if (displayName == null) {
            displayName = "";
        }

        console.log("picture render: ", this.state.picture);

        return (
                <Menu width={'25%'}>
                    <span className="space"></span>
                    <span className="sidebarProfileImg">
                        {this.state.picture === "" ?
                            <img className="userImage" id="img" src="../resources/matilda.png" alt="user picture"></img>
                            :
                            <img className="userImage" id="img" src={this.state.picture} alt="user picture"></img>
                        }

                        <h3 className="greeting"><span className="hi">hi</span> {displayName}</h3>
                    </span>
                    <span className="sidebarMenuItem" onClick={() => this.props.updateHistory("/")}><FaHome className="icon" /><span className="sidebarMenuItemTitle">home</span></span>
                    <span className="sidebarMenuItem" onClick={() => this.props.updateHistory("/profile")}><FaUser className="icon" /><span className="sidebarMenuItemTitle">profile</span></span>
                    <span className="sidebarMenuItem" onClick={() => this.props.updateHistory("/calendar")}><FaCalendar className="icon" /><span className="sidebarMenuItemTitle">calendar</span></span>
                    <span className="sidebarMenuItem" onClick={() => this.props.updateHistory("/listings")}><FaClipboard className="icon" /><span className="sidebarMenuItemTitle">listings</span></span>
                    <span className="sidebarMenuItem" onClick={() => this.props.updateHistory("/inbox")}><FaMailBulk className="icon" /><span className="sidebarMenuItemTitle">inbox</span></span>
                </Menu>
        );
    }

}
