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

import "./Home.css";
import { createBrowserHistory } from 'history';


interface Props extends RouteComponentProps {
    
}

interface State {
    showMessages: boolean;
    showNotifications: boolean;
    showOobe: boolean;
    messages: object;
    alerts: object;
    searchField?: string;
    displayName?: string;
    finalSearchField: string;
    userID?: number;
    windowWidth: number,
    windowHeight: number,
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
            showOobe: false,
            finalSearchField: "",
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
        };
    }
    
    private readonly getUserProfileData = async () => {
        const data = await getJSON("/api/user/name");
        this.setState({
            displayName: data.name,
            userID: data.userID
        });
    };

    private readonly getUserOOBE = async () => {
        const data = await getJSON("/api/user/oobe");
        this.setState({
            showOobe: !data.oobe
        });
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

    private readonly updateDimensions = () =>{
        this.setState({ 
            windowWidth: window.innerWidth, 
            windowHeight: window.innerHeight
        });
    }
    
    /**
     * @override
     */
    public componentDidMount() {
        document.addEventListener('keydown', this.enterKeyPressed);
        window.addEventListener('resize', this.updateDimensions);
        this.getUserOOBE().then();
        this.getUserProfileData().then();
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
        const messages = Object.keys(this.state.messages);
        const notifications = Object.keys(this.state.alerts);

        let minHeight = {minHeight: (this.state.windowHeight * .80).toString() + "px"};

        return (
        <Container fluid className="home">
            <Row className="home-top-row">
                <Sidebar displayName={this.state.displayName} updateHistory={this.updateHistory}/>
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
                            <Modal.Body>TODO: Put messages here</Modal.Body>
                            <Modal.Footer>
                            </Modal.Footer>
                        </Modal>

                        <Button size="sm" className="float-right home-counter">{notifications.length}</Button>
                    <FaStar className="home-notifications" onClick={() => this.setState({ showNotifications: true })}/>
                        <Modal show={this.state.showNotifications} onHide={() => this.setState({ showNotifications: false })} dialogClassName="messages-modal">
                            <Modal.Header closeButton>
                            <Modal.Title>Notifications</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>TODO: Put notifications here</Modal.Body>
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
                                <Route exact path="/" component={HomeContent} />
                                <Route
                                    path="/profile/:userid?"
                                    render={props => <Profile {...props} updateDisplayName={this.updateDisplayName} userID={this.state.userID}/>}
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
