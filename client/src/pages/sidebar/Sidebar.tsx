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
    picture: Blob | null | string;
    src: null | string;
}

/**
 * 
 */
export class Sidebar extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            picture: null,
            src: null
        };
    }

        /**
     * @override
     */
    public async componentDidMount() {
        this.getUserProfilePicture().then(picture => {
           
            //const blob = this.b64toBlob(picture, "application/json");

            this.setState({
                //picture: blob,
                src: picture
            });
        });
    }

    private readonly b64toBlob = (b64Data: any, contentType='', sliceSize=512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
      
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
      
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
      
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
      
        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
      }

    private readonly getUserProfilePicture = async () => {
        const data = await getJSON("/api/user-profile/picture");
        console.log(data);
        return data.picture
    };

    /**
     * @override
     */
    public render(): ReactNode {
        let displayName = this.props.displayName;
        if (displayName == null) {
            displayName = "";
        }

        let url = null;
        if(this.state.picture != null) {
            url = this.state.picture && URL.createObjectURL(this.state.picture);
        } else {
            url = "../resources/matilda.png";
        } 

        console.log('url: ', url);
        console.log('src: ', this.state.src);
        

        return (
                <Menu width={'25%'}>
                    <span className="space"></span>
                    <span className="sidebarProfileImg">
                            <img className="userImage" id="img" src={url} alt="user picture"></img>
                            {this.state.src != null ? <img className="userImage" id="img-src" src={this.state.src} alt="base64 test"/>:null}
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
