import * as React from "react";
import {ReactNode} from "react";
import {Page} from "../Page";
import {RouteComponentProps, Redirect, Route, Switch} from "react-router";
import {Sidebar} from "./sidebar/Sidebar";
import {Container, Row, Col, Form, Button, Modal} from "react-bootstrap";
import {FaStar, FaComment, FaSignOutAlt} from "react-icons/fa";

import {HomeContent} from "./HomeContent";
import {Profile} from "./profile/Profile";
import {Calendar} from "./calendar/Calendar";
import {Listings} from "./listings/Listings";
import {Inbox} from "./inbox/Inbox";
import {SearchResults} from "./search-results/SearchResults";
import {Oobe} from "./oobe/Oobe";
import {getJSON} from "../util/json";
import {Socket} from "./Socket";
import "./Home.css";
import { CalendarEvent } from './calendar/CalendarEvent';


interface Props extends RouteComponentProps {
    
}

interface ServerMessage {
    from: number;
    timeSent: Date;
    content: string;
}

export interface Message {
    userID: number;
    timeSent: Date;
    text: string;
    seen: boolean;
}

export interface ConversationEntry {
    conversationID: number;
    lastSeen: Date|undefined;
    entries: Message[];
}

interface Listing {
    id: number,
    userID: number,
    username: string,
    title: string,
    description: string,
    tags: {
        id: number,
        name: string
    }[];
    anonymous: boolean,
    timePosted: Date,
}

interface State {
    showMessages: boolean;
    showNotifications: boolean;
    showOobe: boolean;
    alerts: object;
    searchField?: string;
    displayName?: string;
    finalSearchField: string;
    userID?: number;
    windowWidth: number;
    windowHeight: number;
    conversations: ConversationEntry[];
    lastMessage: Date|null;
    portraitURL: any;
    messages: Message[];
    notifications: {
        title: string;
        description: string|undefined;
    }[]
}

/**
 *
 */
export class Home extends Page<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            alerts: {},
            searchField: "",
            showMessages: false,
            showNotifications: false,
            showOobe: false,
            finalSearchField: "",
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            conversations: [],
            lastMessage: null,
            portraitURL: null,
            messages: [],
            notifications: []
        };
        this.socket = null;
    }

    protected socket: Socket|null;
    
    private readonly getUserProfileData = async () => {
        const data = await getJSON("/api/user/name");
        return data;
    };

    private readonly getUserOOBE = async () => {
        const data = await getJSON("/api/user/oobe");
        return !data.oobe;
    };

    private readonly logUserOut = async() => {
        return fetch("/logout", {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            referrer: "no-referrer",
        }).then(response => {
            this.props.history.push('/login');
        });
    };

    private readonly updateDisplayName = (displayName: string) => {
        this.setState({
            displayName: displayName
        });
    };

    private readonly setSearchField = (e: any) => {
        this.setState({searchField: e.target.value});
    };

    private readonly enterKeyPressed = (e: any) => {
        if (e.keyCode === 13 && this.state.searchField != "") {
            e.preventDefault();
            if (this.state.searchField != undefined) {
                if (this.state.searchField == "[ALL]") {
                    this.setState({finalSearchField: ""})
                }
                else {
                    this.setState({finalSearchField: this.state.searchField})
                }
            }
            this.props.history.push('search-results')
        }
    };

    private readonly updateHistory = (v: string) => {
        this.props.history.push(v);
    };

    private readonly logout = () => {
        this.logUserOut().then();
    };

    private readonly updateDimensions = () => {
        this.setState({ 
            windowWidth: window.innerWidth, 
            windowHeight: window.innerHeight
        });
    };

    private readonly getSendMessages = () => {
        if (this.socket) {
            return this.socket.sendMessage;
        } else { 
            return () => {};
        }
    };

    private readonly getGetMoreMessages = () => {
        if (this.socket) {
            return this.socket.getMoreMessages;
        } else {
            return () => {};
        }
    };

    private readonly getSeenRecent = () => {
        if (this.socket) {
            return this.socket.seenRecent;
        } else {
            return () => {};
        }
    };

    private readonly getGetParticipants = () => {
        if (this.socket) {
            return this.socket.getParticipants;
        } else {
            return (conversationID: number) => {
                let promise: Promise<Map<number,string>> = new Promise((resolve, reject) => {
                    resolve(new Map<number,string>());
                });
                return promise;
            };
        }
    };

    private readonly updateMessages = (messages: ConversationEntry[]) => {
        this.setState({conversations: messages});
    };

    private readonly updatePortraitURL = async () => {
        this.setState({
            portraitURL: await this.getUserProfilePicture()
        });
    };

    private readonly getUserProfileDefault = () => {
        return "../resources/matilda.png";
    };

    private readonly getUserProfilePicture = async () => {
        const data = await getJSON("/api/user-profile/picture");
        if ('error' in data) {
            return this.getUserProfileDefault();
        }

        return data.picture;
    };
    
    /**
     * @override
     */
    public async componentDidMount() {
        document.addEventListener('keydown', this.enterKeyPressed);
        window.addEventListener('resize', this.updateDimensions);

        const [ showOobe, data, picture ] = await Promise.all([
            this.getUserOOBE(),
            this.getUserProfileData(),
            this.getUserProfilePicture()
        ]);

        this.setState({
            showOobe: showOobe,
            displayName: data.name,
            userID: data.userID,
            portraitURL: picture
        });
        
        this.socket = new Socket(this.updateMessages);
        await this.socket.getUnreadMessages();
        this.setState({lastMessage : await this.socket.gotLastMessage})
        console.log("In home component did mount");
        console.log(this.state.conversations);
        this.findNewest().then()
    }

    public componentDidUpdate(prevProps:Props, prevState:State) {
        if (this.socket != null && this.state.lastMessage != null) {
            if (this.socket.gotLastMessage != this.state.lastMessage) {
                this.state.conversations.map((conversation) => 
                prevState.conversations.map((prevConversation) => 
                {if (prevConversation.conversationID == conversation.conversationID) {
                    if (this.state.lastMessage != null) {
                        if (conversation.entries[0].timeSent.toString() > this.state.lastMessage.toISOString()) {
                            let newMessages = this.state.messages
                            newMessages.push(conversation.entries[0])
                            this.setState({messages: newMessages})
                        }
                    }
                }}))
                this.setState({lastMessage: this.socket.gotLastMessage})
            }
        }
    }

    public showMessage(message: Message) {
        return (
            <div className="home-new-messages">
            {message.text} 
            {message.timeSent}
            </div>
        )
    }

    public async findNewest() {
        const events : CalendarEvent[] = await getJSON("/api/events");
        const listings : Listing[] = await getJSON("/api/listings/allListings")
        let newEvents: CalendarEvent[] = []
        let newListings: Listing[] = []
        let times: any[] = []
        events.map(event => listings.map(listing =>
        {
            if (event.start < times[0] || times[0] == null) {
                console.log("Notification 1 got")
                times[0] = event.start
                newEvents[0] = event
                if(newEvents[0].description == null) {
                    newEvents[0].description == ""
                }
            }
            else if(event.start < times[1] || times[1] == null) {
                console.log("Notification 2 got")
                times[1] = event.start
                newEvents[1] = event
                if(newEvents[1].description == null) {
                    newEvents[1].description == ""
                }
            }
            if(listing.timePosted < times[2] || times[2] == null) {
                console.log("Notification 3 got")
                times[2] = listing.timePosted
                newListings[0] = listing
            }
            else if(listing.timePosted < times[3] || times[3] == null) {
                console.log("Notification 4 got")
                times[3] = listing.timePosted
                newListings[1] = listing
            }
        }))
        let notifications: {title: string, description: string|undefined}[] = []
        console.log("New listings", newListings)
        console.log("New Events", newEvents)
        notifications[0].title = newListings[0].title
        console.log("Test")
        notifications[0].description = newListings[0].description
        notifications[1].title = newListings[1].title
        notifications[1].description = newListings[1].description
        notifications[2].title = newEvents[0].title
        notifications[2].description = newEvents[0].description
        notifications[3].title = newEvents[1].title
        notifications[3].description = newEvents[1].description
        console.log("Notifications:", notifications)
        this.setState({notifications: notifications})
    }

    public showNotification(notification: {title: string, description: string|undefined}) {
        return (
            <div className="home-new-notification">
            {notification.title} 
            {notification.description}
            </div>
        )
    }
    
    /**
     * @override
     */
    public componentWillUnmount() {
        document.removeEventListener('keydown', this.enterKeyPressed);
        window.removeEventListener('resize', this.updateDimensions);
    }

    /**
     * @override
     */
    public render(): ReactNode {
        const messages = [];
        const notifications = Object.keys(this.state.alerts);

        let minHeight = {minHeight: (this.state.windowHeight * .80).toString() + "px"};

        return (
        <Container fluid className="home">
            <Row className="home-top-row">
                <Sidebar displayName={this.state.displayName} updateHistory={this.updateHistory} portraitURL={this.state.portraitURL}/>
                <Col sm={1} md={1} className="home-top-left-col"></Col>
                <Col sm={4} md={4} className="home-top-center-col">
                    <Form>
                        <Form.Group className="form-basic">
                            <Form.Control type="text" className="generic" placeholder="search" onChange={this.setSearchField} />
                        </Form.Group>
                    </Form>
                </Col>
                <Col sm={7} md={7} className="home-top-right-col">
                    <FaSignOutAlt className="home-logout" onClick={this.logout}/>
                        <Button size="sm" className="float-right home-counter">{messages.length}</Button>
                        <FaComment className="home-notifications" onClick={() => this.setState({ showMessages: true })}/>
                        <Modal show={this.state.showMessages} onHide={() => this.setState({ showMessages: false })} dialogClassName="messages-modal">
                            <Modal.Header closeButton>
                            <Modal.Title>Messages</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>New Messages: {this.state.messages.map(message => this.showMessage(message))}</Modal.Body>
                            <Modal.Footer>
                            </Modal.Footer>
                        </Modal>

                        <Button size="sm" className="float-right home-counter">{notifications.length}</Button>
                    <FaStar className="home-notifications" onClick={() => this.setState({ showNotifications: true })}/>
                        <Modal show={this.state.showNotifications} onHide={() => this.setState({ showNotifications: false })} dialogClassName="messages-modal">
                            <Modal.Header closeButton>
                            <Modal.Title>Notifications</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>TODO: Put notifications here {this.state.notifications.map(notification => this.showNotification(notification))}</Modal.Body>
                            <Modal.Footer>
                            </Modal.Footer>
                        </Modal>
                </Col>
            </Row>
            <Row className="home-main">
                <Col sm={10} md={10} className="home-main-content">
                    <Row>
                        <Col sm={10} md={11} className="home-component" style={minHeight}>
                            <Switch>
                                <Route
                                    exact path="/"
                                    render={props => <HomeContent {...props} />}
                                />
                                <Route
                                    path="/profile"
                                    render={props => <Profile {...props} updateDisplayName={this.updateDisplayName} userID={this.state.userID} updatePortraitURL={this.updatePortraitURL} getUserProfileDefault={this.getUserProfileDefault}/>}
                                />
                                <Route
                                    path="/calendar" component={Calendar}
                                />
                                <Route
                                    path="/listings"
                                    render={props => <Listings {...props} userID={this.state.userID} />}
                                />
                                <Route path="/inbox"
                                       render={(props) => <Inbox {...props} conversations={this.state.conversations}
                                                                 sendMessage={this.getSendMessages()}
                                                                 getMoreMessages={this.getGetMoreMessages()}
                                                                 seenRecent={this.getSeenRecent()}
                                                                 userID={this.state.userID ? this.state.userID : 0}
                                                                 getParticipants={this.getGetParticipants()}/>}
                                />
                                <Route
                                    path="/search-results"
                                    render={props => <SearchResults {...props} finalSearchField={this.state.finalSearchField} />}
                                />
                                <Redirect to="/" />
                            </Switch> 
                        </Col>
                    </Row>
                </Col>
                <Col sm={2} md={2} className="home-right-sidebar">Ad Space</Col>
            </Row>

            <Modal size="lg" show={this.state.showOobe} onHide={() => this.setState({ showOobe: false })} dialogClassName="home-oobe-modal" backdrop="static">
                <Modal.Header><h4>Hey {this.state.displayName}!</h4></Modal.Header>
                <Modal.Body><Oobe onHide={() => this.setState({ showOobe: false })}/></Modal.Body>
                <Modal.Footer>
                </Modal.Footer>
            </Modal>
        </Container>);
    }

}
