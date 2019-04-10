import * as React from "react";
import {ReactNode} from "react";
import {Page} from "../Page";
import {RouteComponentProps} from "react-router";
import { Sidebar } from "./Sidebar";
import { Container, Row, Col, Form, Button, Modal} from "react-bootstrap";
import { FaStar, FaComment, FaSignOutAlt } from "react-icons/fa";
import * as ws from "ws"

import "./Home.css";

import { HomeContent } from "./HomeContent";
import { Profile } from "./Profile";
import { Calendar } from "./Calendar";
import { Listings } from "./Listings";
import { Inbox } from "./Inbox";
import { Settings } from "./Settings";
import { SearchResults } from "./SearchResults";

import { Oobe } from "./profile/Oobe";

interface Props extends RouteComponentProps {
    
}

export interface Message {
    userID: number;
    text: string;
    timeSent: number;
    seen: boolean;
}

export interface ConversationEntry {
    conversationID: number;
    entries: Message[];
}

interface State {
    messages: ConversationEntry[];
    alerts: object;
    searchField?: string;
    showMessages?: boolean; // TODO is this necessary?
    showNotifications?: boolean;
    displayName?: string | undefined;
    showOobe: boolean;
    messageCount: number; // TODO is this necessary?
    notificationCount: number;
}

/**
 *
 */
export class Home extends Page<Props, State> {

    private socket: WebSocket|null = null;
    
    constructor(props: Props) {
        super(props);
        this.state = {
            messages: [],
            alerts: {},
            searchField: "",
            showMessages: false,
            showNotifications: false,
            displayName: "",
            showOobe: false,
            messageCount: 0, 
            notificationCount: 0,
        };
    }
    
    private readonly getUserName = async () => {
        const response: Response = await fetch("/api/user/name", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        const name: string|undefined = data.name;
        this.setState({displayName: name});
    };

    private readonly getUserOOBE = async () => {
        const response: Response = await fetch("/api/user/oobe", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        this.setState({showOobe: !data.oobe});
    };

    private readonly logUserOut = async() => {
        return fetch("/logout", {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            referrer: "no-referrer",
        }).then(response => { response; this.props.history.push('/login'); });
    };

    // TODO is this necessary?
    private readonly showMessages = () => {
        this.setState({showMessages: true});
    };

    // TODO is this necessary?
    private readonly closeMessages = () => {
        this.setState({showMessages: false});
    };

    private readonly closeOobe = () => {
        this.setState({showOobe: false});
    };

    private readonly showNotifications= () => {
        this.setState({showNotifications: true});
    };

    private readonly closeNotifications= () => {
        this.setState({showNotifications: false});
    };

    private readonly setSearchField = (e: any) => {
        this.setState({searchField: e.target.value});
    };

    private readonly enterKeyPressed = (e: any) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.props.history.push('search-results')
        }
    };
    
    private readonly logout = () => {
        this.logUserOut().then();
    };

    /*
        Messaging Functions
    */
    // Is this necessary?
    private readonly parseMessage = (msg: MessageEvent) => {
        let result: ConversationEntry = JSON.parse(msg.data);
        let everythingIsNotGood = true;
        // TODO: Add any important checks
        if (everythingIsNotGood) {
            result.conversationID = 0;
        }
        return result;
    };

    // Update the messages state element to include new messages
    private readonly addNewMessages = (newMessages: ConversationEntry) => {
        let tempMessages: ConversationEntry[] = this.state.messages;
        let length = tempMessages.length;
        let foundAt = -1;

        // See whether an entry for the user exists
        for(let i = 0; i < length; ++i) {
            if (tempMessages[i].conversationID == newMessages.conversationID) {
                foundAt = i;
                break;
            }
        }
        // If the user entry exists, append messages
        if (foundAt >= 0) {
            length = newMessages.entries.length;
            for(let i = 0; i < length; ++i) {
                tempMessages[foundAt].entries.push(newMessages.entries[i]);
            }
        }
        // Otherwise just append UserEntry object
        else {
            tempMessages.push(newMessages);
        }
        // Update the state of the this component
        this.setState({messages: tempMessages, messageCount: this.state.messageCount+1});

    };

    // Get the initial backlog of messages
    private readonly getUnreadMessages = async () => {
        const response: Response = await fetch("/messages/backlog", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            /* Unnecessary? 
            body: JSON.stringify({
                userID: userID,
                verificationCode: confirmationCode
            })*/
        });
    };

    // Get more messages for a particular conversation, update messages state elemtn
    private readonly getMoreMessages = (conversationID: number) => {
        // TODO: Add post request asking for older messages
    };

    // Send a message to the server, insert it into our message log
    private readonly sendMessage = (conversationID: number, msg: any) => {
        console.log("This is the message: ", msg);
    };
    
    /**
     * @override
     */
    public componentDidMount() {
        document.addEventListener('keydown', this.enterKeyPressed);
        this.getUserOOBE().then();
        this.getUserName().then();
        
        this.socket = new WebSocket("ws://localhost:9999");
        // Get unread messages from before we were connected
        this.getUnreadMessages();

        // Establish behavior of connection
        this.socket.onopen = () => {
            // When a message is received, do...
            if( this.socket != null ) { // TODO: this check is a hacky work around
                this.socket.onmessage = (msg: MessageEvent) => {
                    let newMessages: ConversationEntry = this.parseMessage(msg);
                    this.addNewMessages(newMessages);
                }
                this.socket.onerror = (error) => {
                }
                this.socket.onclose = (closed) => {
                }
            }
        }
    }
    
    /**
     * @override
     */
    public componentWillUnmount() {
        document.removeEventListener('keydown', this.enterKeyPressed);

        if(this.socket != null) {
            this.socket.close();
        }
    }

    public updateHistory = (v: string) => {
        this.props.history.push(v);
    }

    /***
     * @override
     */
    public render(): ReactNode {

        const content: { [key: string]: any } = {
            "/": HomeContent,
            "/profile": Profile,
            "/calendar": Calendar,
            "/listings": Listings,
            "/inbox": Inbox,
            "/settings": Settings,
            "/search-results": SearchResults
        };

        const title: { [key: string]: any } = {
            "/": 'home',
            "/profile": 'profile',
            "/calendar": 'calendar',
            "/listings": 'listings',
            "/inbox": 'inbox',
            "/settings": 'settings',
            "/search-results": 'search results'
        };
        
        let CurrentContent = content[this.props.history.location.pathname];

        return (
        <Container fluid className="home">
            <Row className="topRow">
                <Sidebar displayName={this.state.displayName} updateHistory={this.updateHistory}/>
                <Col sm={1} md={1} className="topLeft"></Col>
                <Col sm={4} md={4} className="topCenter">
                    <Form>
                        <Form.Group className="formBasic">
                            <Form.Control type="text" className="generic" placeholder="search" onChange={this.setSearchField} />
                        </Form.Group>
                    </Form>
                </Col>
                <Col sm={7} md={7} className="topRight">
                    <FaSignOutAlt className="logout" onClick={this.logout}/>
                    <Button size="sm" className="floatRight counter">{this.state.messageCount}</Button>
                        <FaComment className="notifications" onClick={this.showMessages}/>
                        <Modal show={this.state.showNotifications} onHide={this.closeNotifications} dialogClassName="messages-modal">
                            <Modal.Header closeButton>
                            <Modal.Title>Notifications</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>TODO: Put notifications here</Modal.Body>
                            <Modal.Footer>
                            </Modal.Footer>
                        </Modal>
                    <Button size="sm" className="floatRight counter">{this.state.notificationCount}</Button>
                        <FaStar className="notifications" onClick={this.showNotifications}/>
                        <Modal show={this.state.showMessages} onHide={this.closeMessages} dialogClassName="messages-modal">
                            <Modal.Header closeButton>
                            <Modal.Title>Messages</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>TODO: Put messages here</Modal.Body>
                            <Modal.Footer>
                            </Modal.Footer>
                        </Modal>
                        
                </Col>
            </Row>
            <Row className="main">
                <Col sm={10} md={10} className="mainContent">
                    <Row>
                        <Col sm={10} md={11} className="pageTitle"> {title[this.props.history.location.pathname]} </Col>
                    </Row>
                    <Row>
                        <Col sm={10} md={11} className="component"> 
                            <CurrentContent sendMessage={this.sendMessage}/> 
                        </Col>
                    </Row>
                </Col>
                <Col sm={2} md={2} className="rightSidebar">Ad Space</Col>
            </Row>

            <Modal size="lg" show={this.state.showOobe} onHide={this.closeOobe} dialogClassName="oobe-modal" backdrop="static">
                <Modal.Header><h4>Hey {this.state.displayName}!</h4></Modal.Header>
                <Modal.Body><Oobe onHide={this.closeOobe}/></Modal.Body>
                <Modal.Footer>
                </Modal.Footer>
            </Modal>
        </Container>);
    }

}
