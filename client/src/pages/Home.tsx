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
import { number } from "prop-types";

interface Props extends RouteComponentProps {
    
}

interface ServerMessage {
    from: number;
    timeSent: number;
    content: string;
}

export interface Message {
    userID: number;
    timeSent: number;
    text: string;
    seen: boolean;
}

export interface ConversationEntry {
    conversationID: number;
    lastSeen: number;
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
    private readonly convertMessages = (messages: ServerMessage[], lastSeen: number) => {
        let toReturn: Message[] = [];

        for(let i = 0; i < messages.length; ++i) {
            // TODO Unsure whether to use checks or enforce types in the argument list
            toReturn.push({
                userID: messages[i].from,
                timeSent: messages[i].timeSent,
                text: messages[i].content,
                seen: true ? messages[i].timeSent < lastSeen : false
            });
        }
        return toReturn;
    };

    // Update the messages state element to include new messages
    private readonly addToConversation = (newMessages: ConversationEntry) => {
        let tempMessages: ConversationEntry[] = this.state.messages;
        let length = tempMessages.length;
        let foundAt = -1;

        // See whether an entry for the conversation exists exists
        for(let i = 0; i < length; ++i) {
            if (tempMessages[i].conversationID == newMessages.conversationID) {
                foundAt = i;
                break;
            }
        }
        // If the user entry exists, add the messages
        if (foundAt >= 0) {
            length = newMessages.entries.length;
            for(let i = length-1; i <= 0; --i) {
                // Ignore messages which are already in the log
                if ( newMessages.entries[i].timeSent < tempMessages[foundAt].entries[0].timeSent ) {
                    continue;
                } else if ( newMessages.entries[i].timeSent == tempMessages[foundAt].entries[0].timeSent 
                            &&  newMessages.entries[i].userID == tempMessages[foundAt].entries[0].userID 
                            &&  newMessages.entries[i].text == tempMessages[foundAt].entries[0].text ) {
                    continue;
                } else { 
                    tempMessages[foundAt].entries.unshift(newMessages.entries[i])
                }
            }
        }
        // Otherwise just append UserEntry object
        else {
            tempMessages.push(newMessages);
        }
        // Update the state of the this component
        this.setState({messages: tempMessages});
    };

    // Get the initial backlog of messages
    private readonly getUnreadMessages = async () => {
        let conversations: ConversationEntry[] = [];

        const response: Response = await fetch("/api/messages/backlog", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if(data.length == null) {
            // TODO throw an error
            console.log("error in getUnreadMessages")
            return;
        }
        // For each conversation returned, put it in the messages element
        for (let i = 0; i < data.length; ++i) {
            // Enforce types before moving on
            if(typeof data[i] !== "object") {
                // TODO throw an error
                console.log("error in getUnreadMessages")
                return;
            }
            const conversationID: number = data[i].conversationID;
            const lastSeen: number = data[i].lastSeen;
            const messages: ServerMessage[] = data[i].messages;
            if (conversationID == null || lastSeen == null || messages == null) {
                // TODO throw error
                console.log("error in getUnreadMesasages");
                return;
            }
            // Add the conversaion
            conversations.push({
                conversationID: conversationID,
                lastSeen: lastSeen,
                entries: this.convertMessages(messages, lastSeen)
            });
        }
        // Update messages, this should force rerender to components which use messages
        this.setState({messages: conversations});
    };

    // Get more messages for a particular conversation, update messages state elemtn
    private readonly getMoreMessages = async (conversationID: number) => {
        let conversation: ConversationEntry;
        let alreadyHave: number = 0;
        let lastSeen: number = 0;
    
        // Search for the conversation, get the number of existing messages
        for (let i = 0; i < this.state.messages.length; ++i) {
            if (this.state.messages[i].conversationID == conversationID) {
                alreadyHave = this.state.messages[i].entries.length;
                lastSeen = this.state.messages[i].lastSeen;
                break;
            }
        }
        // Get the messages from the server
        const response: Response = await fetch("/api/messages/more", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversationID: conversationID,
                alreadyHave: alreadyHave,
            })
        });
        // Turn the response into a ConversationEntry
        const data = await response.json();
        if (data == null) {
            // TODO throw an error
            console.log("error in getMoreMessages");
            return;
        }
        let messages: ServerMessage[] = data;
        if (messages == null) {
            // TODO throw an error
            console.log("error in getMoreMessages");
            throw new Error();
        }
        conversation = {
            conversationID: conversationID,
            lastSeen: lastSeen, 
            entries: this.convertMessages(messages, lastSeen)
        };
        this.addToConversation(conversation);
    };

    // Send a message to the server, insert it into our message log
    private readonly sendMessage = (conversationID: number, msg: string) => {
        let tempMessages: ConversationEntry[] = this.state.messages;
        if (this.socket == null) {
            // TODO send error
            console.log("error in sendMessage");
            return;
        }
        // Send the message as a string
        this.socket.send(JSON.stringify({
            type: "message", 
            conversationID: conversationID,
            content: msg
        }));
        // Search the messages log, find the conversation, add the message
        for (let i = 0; i < tempMessages.length; ++i) {
            if (tempMessages[i].conversationID == conversationID) {
                tempMessages[i].entries.unshift({
                    userID: 0, // !!! TODO get userID
                    timeSent: Date.now(),
                    text: msg,
                    seen: true
                });
                break;
            }
        }
        this.setState({messages: tempMessages});
    };

    private readonly seenRecent = (conversationID: number, time: number) => {
        // TODO write the function
        return;
    }

    /*
        End Messaging Functions
    */
    
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
                    // TODO Replace parseMessage with in-function code
                    this.addToConversation(newMessages);
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
