import * as React from "react";
import {ReactNode} from "react";
import {Page} from "../Page";
import {RouteComponentProps, Redirect, Route, Switch} from "react-router";
import { Sidebar } from "./sidebar/Sidebar";
import { Container, Row, Col, Form, Button, Modal} from "react-bootstrap";
import { FaStar, FaComment, FaSignOutAlt } from "react-icons/fa";

import "./Home.css";

import { HomeContent } from "./HomeContent";
import { Profile } from "./profile/Profile";
import { Calendar } from "./calendar/Calendar";
import { Listings } from "./listings/Listings";
import { Inbox } from "./inbox/Inbox";
import { SearchResults } from "./search-results/SearchResults";
import { Oobe } from "./oobe/Oobe";

interface Props extends RouteComponentProps {
    
}

interface State {
    messages: object;
    alerts: object;
    searchField?: string;
    showMessages?: boolean;
    showNotifications?: boolean;
    displayName?: string | undefined;
    showOobe: boolean;
    finalSearchField: string;
    userID: null | number;
}

/**
 *
 */
export class Home extends Page<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            messages: {},
            alerts: {},
            searchField: "",
            showMessages: false,
            showNotifications: false,
            displayName: "",
            showOobe: false,
            finalSearchField: "",
            userID: null
        };
    }
    
    private readonly getUserProfileData = async () => {
        const response: Response = await fetch("/api/user/name", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        this.setState({
            displayName: data.name,
            userID: data.userID
        });
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
    }

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

    private readonly updateDisplayName = (displayName: string) => {
        this.setState({displayName: displayName});
    };

    private readonly handleModalClose = (e: any) => {
        this.setState({
            [e]: false
        } as any);
    };

    private readonly setSearchField = (e: any) => {
        this.setState({searchField: e.target.value});
    };

    private readonly enterKeyPressed = (e: any) => {
        if (e.keyCode === 13 && this.state.searchField != "") {
            e.preventDefault();
            if (this.state.searchField != undefined) {
                this.setState({finalSearchField: this.state.searchField})
            }
            this.props.history.push('search-results')
            
        }
    };
    
    private readonly logout = () => {
        this.logUserOut().then();
    };
    
    /**
     * @override
     */
    public componentDidMount() {
        document.addEventListener('keydown', this.enterKeyPressed);
        this.getUserOOBE().then();
        this.getUserProfileData().then();
    }
    
    /**
     * @override
     */
    public componentWillUnmount() {
        document.removeEventListener('keydown', this.enterKeyPressed);
    }

    public updateHistory = (v: string) => {
        this.props.history.push(v);
    }

    /**
     * @override
     */
    public render(): ReactNode {

        let messages = Object.keys(this.state.messages);
        let notifications = Object.keys(this.state.alerts);

        const title: { [key: string]: any } = {
            "/": 'home',
            "/profile": 'profile',
            "/calendar": 'calendar',
            "/listings": 'listings',
            "/inbox": 'inbox',
            "/search-results": 'search results'
        };
        

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
                        <Button size="sm" className="floatRight counter">{messages.length}</Button>
                        <FaComment className="notifications" onClick={() => this.setState({ showMessages: true })}/>
                        <Modal show={this.state.showMessages} onHide={() => this.handleModalClose('showMessages')} dialogClassName="messages-modal">
                            <Modal.Header closeButton>
                            <Modal.Title>Messages</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>TODO: Put messages here</Modal.Body>
                            <Modal.Footer>
                            </Modal.Footer>
                        </Modal>

                        <Button size="sm" className="floatRight counter">{notifications.length}</Button>
                    <FaStar className="notifications" onClick={() => this.setState({ showNotifications: true })}/>
                        <Modal show={this.state.showNotifications} onHide={() => this.handleModalClose('showNotifications')} dialogClassName="messages-modal">
                            <Modal.Header closeButton>
                            <Modal.Title>Notifications</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>TODO: Put notifications here</Modal.Body>
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
                            <Switch>
                                <Route exact path="/" component={HomeContent} />
                                <Route
                                    path="/profile"
                                    render={props => <Profile {...props} updateDisplayName={this.updateDisplayName} />}
                                />
                                <Route path="/calendar" component={Calendar} />
                                <Route path="/listings" component={Listings} />
                                <Route path="/inbox" component={Inbox} />
                                <Route
                                    path="/search-results"
                                    render={props => <SearchResults {...props} finalSearchField={this.state.finalSearchField} />}
                                />
                                <Redirect to="/" />
                            </Switch> 
                        </Col>
                    </Row>
                </Col>
                <Col sm={2} md={2} className="rightSidebar">Ad Space</Col>
            </Row>

            <Modal size="lg" show={this.state.showOobe} onHide={() => this.handleModalClose('showOobe')} dialogClassName="oobe-modal" backdrop="static">
                <Modal.Header><h4>Hey {this.state.displayName}!</h4></Modal.Header>
                <Modal.Body><Oobe onHide={() => this.handleModalClose('showOobe')}/></Modal.Body>
                <Modal.Footer>
                </Modal.Footer>
            </Modal>
        </Container>);
    }

}
