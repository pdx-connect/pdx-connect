import * as React from "react";
import {Component, ReactNode} from "react";
import { FaHome, FaUser, FaCog, FaCalendar, FaClipboard, FaMailBulk} from 'react-icons/fa';
import { slide as Menu } from 'react-burger-menu';

import "./Sidebar.css";


interface Props {
    displayName: string | undefined;
    updateHistory: (value: string) => void,
}

interface State {
}

/**
 * 
 */
export class Sidebar extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

  
    
    /**
     * @override
     */
    public render(): ReactNode {

        let displayName = this.props.displayName;
        if(displayName === undefined)
            displayName = "";

        return (
                <Menu width={'25%'}>
                    <span className="space"></span>
                    <span className="sidebarProfileImg">
                        <img className="userImage" src="../resources/matilda.png"></img>
                        <h3 className="greeting"><span className="hi">hi</span> {displayName}</h3>
                    </span>
                    <span className="sidebarMenuItem" onClick={() => this.props.updateHistory("/")}><FaHome className="icon" /><span className="sidebarMenuItemTitle">home</span></span>
                    <span className="sidebarMenuItem" onClick={() => this.props.updateHistory("/profile")}><FaUser className="icon" /><span className="sidebarMenuItemTitle">profile</span></span>
                    <span className="sidebarMenuItem" onClick={() => this.props.updateHistory("/calendar")}><FaCalendar className="icon" /><span className="sidebarMenuItemTitle">calendar</span></span>
                    <span className="sidebarMenuItem" onClick={() => this.props.updateHistory("/listings")}><FaClipboard className="icon" /><span className="sidebarMenuItemTitle">listings</span></span>
                    <span className="sidebarMenuItem" onClick={() => this.props.updateHistory("/inbox")}><FaMailBulk className="icon" /><span className="sidebarMenuItemTitle">inbox</span></span>
                    <span className="sidebarMenuItem" onClick={() => this.props.updateHistory("/settings")}><FaCog className="icon" /><span className="sidebarMenuItemTitle">settings</span></span>
                </Menu>
        );
    }

}