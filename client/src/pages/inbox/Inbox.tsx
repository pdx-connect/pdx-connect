import * as React from "react";
import {Container, Row, Col, Form, FormControl, Button} from "react-bootstrap";
import {Component, ReactNode} from "react";
import {Message, ConversationEntry} from "../Home";
import {getJSON, postJSON} from '../../util/json';
import * as queryString from "query-string";

import "./Inbox.css";
import { RouteChildrenProps } from 'react-router';


interface Props extends RouteChildrenProps {
    sendMessage: (msg: string, conversationID: number|null, userID:number[]|null) => void;
    getMoreMessages: (conversationID: number) => void;
    seenRecent: (conversationID: number, time: Date) => void;
    conversations: ConversationEntry[];
    userID: number;
    getParticipants: (conversationID: number) => Promise<Map<number, string>|undefined>;
}

interface State {
    currentConversationIndex?: number;
    currentConversationID?: number;
    textField: string;
    composingNewConvo: boolean;
    composingNewConvoParticipants: number[];
    users?: any;
}

/**
 *  CONSTRUCTOR
 */
export class Inbox extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            textField: "",
            composingNewConvo: false,
            composingNewConvoParticipants: [],
        }
    }

    private readonly getUsers = async () => {
        let data: any;
        data = await getJSON("/api/user/findnames");
        this.setState({users: data.results});
    };

    /*
    *   Message textfield state is updated on each keystroke
    */
    private readonly onTextFieldChange = (e: any) => {
        e.preventDefault();
        this.setState({textField: e.target.value});
    };

    /*
    *   On send or ENTER key, sendMessage() broadcasts to socket
    *   message is sent
    */
    private readonly onSend = (e: any) => {
        e.preventDefault();

        if (this.state.composingNewConvo && this.state.textField != "") {
            //console.log("Sending message! with Participants: ", this.state.composingNewConvoParticipants);
            this.props.sendMessage(this.state.textField, null, this.state.composingNewConvoParticipants);
            this.setState({
                composingNewConvoParticipants: [], // Clear participants array
                composingNewConvo: false,
                currentConversationIndex: 0, // Set the conversations index to most recent
                currentConversationID: this.props.conversations[0].conversationID // Set the respective ID
            });
        }
        else if (this.state.currentConversationID && this.state.textField != "") {
            this.props.sendMessage(this.state.textField, this.state.currentConversationID, null);
        }
        this.setState({textField: ""});
    }

    /*
    *   onCompose:  On enter of compose button, a new
    *               conversation window is rendered
    *   
    */
    private readonly onCompose = (e: any) => {
        e.preventDefault();
        // composingNewConvo state is used so the other functions don't print when a
        // new convo is being made, the currentConvo ID and index are set to -1
        // so that no iterator can reach it (iterators shouldn't even be entered).
        // The composingNewConvo state is set to false as well as the index and ID to its'
        // respective number once a user clicks on a conversation on the left side.
        this.setState({
            composingNewConvo: true,
            currentConversationID: -1,
            currentConversationIndex: -1
        });
    }

    /*
    *    setParticipants:    callback for once a user updates the partcipants field
    *                        once state is in newConversation mode. The whole 
    *                        composingNewConvoParticipants is updated on every change.
    *
    */
    private readonly setParticipents = (e: any) => {
        var options = e.target.options;
        var value = [];

        for (var i = 0, len = options.length; i < len; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        this.setState({composingNewConvoParticipants: value});
        //console.log("Current participants: ", value); // Shows the list of the IDs only
    }

    /* 
    *   renderParticipents:    renders the participants of a conversation,
    *                   only renders/opens one conversation at a time,
    *                   Otherwise, converastion composer is default
    *                   and this field is open for adding users to the conversation
    *                   (right-top window of inbox)
    */
    private readonly renderParticipents = () => {
        let rows = [];
        let users = [];

        // If in composingNewConvo state, will return a selection window of all users
        if (this.state.composingNewConvo) {

            if (this.state.users) {
                for(let i=0; i<this.state.users.length; i++) {
                    users.push(<option key={i} value={this.state.users[i].userID}> {this.state.users[i].displayName}</option>);
                }
            }

            rows.push(
                <Form className="inbox-user-select-form">
                    <Form.Control as="select" multiple className="user-select" onChange={(e: any) => this.setParticipents(e)}> 
                        {users}
                    </Form.Control>
                </Form>
            );
            return rows; // We must return, othewise unknown behaviour because of -1 convo index and ID
        }

        var participents:any = [];

        // Array of strings of the participants taken from the 30 recent messages, 
        // TODO (IMPORTANT): This will only will participants from the latest 30 messages, if you're included in the conversation but you never sent out
        //                   a message, your name will not be included!
        if (this.props.conversations != null && this.state.currentConversationIndex != null && this.state.users != undefined) {
            for (let i=0; i<this.props.conversations[this.state.currentConversationIndex].entries.length; i++) {
                if (participents.indexOf(this.props.conversations[this.state.currentConversationIndex].entries[i].userID) == -1) {
                    if (!participents.includes(this.state.users[this.state.users.findIndex((x:any) => x.userID == this.props.conversations[this.state.currentConversationIndex!].entries[i].userID)].displayName)) {
                        participents.push(this.state.users[this.state.users.findIndex((x:any) => x.userID == this.props.conversations[this.state.currentConversationIndex!].entries[i].userID)].displayName);
                    }      
                }
            }
        }

        // Same array as above but formated with commas for rendering
        if (this.props.conversations != null) {
            rows.push("Participent IDs: ")
            for (let i=0; i<participents.length; i++) {
                rows.push(participents[i]);
                if (i != participents.length-1)
                    rows.push(", ");
            }
        }
        return rows;
    }

    /* 
    *   renderInbox:   renders the selectable list of conversations the user is a part of, 
    *               along with a prewview of the lastest message
    *               (left window of inbox)
    */
    private readonly renderInbox = () => {
        let rows = [];

        if (this.state.composingNewConvo) {
            rows.push(
                <Row className="inbox-open-conversation" key={-1}>
                    <Col key={-1} sm={12}>
                        Starting new conversation...
                    </Col>
                </Row>
            );
        }

        if (this.props.conversations != null && this.state.users) {
            for (let i=0; i<this.props.conversations.length; i++) {
                if (i == this.state.currentConversationIndex) {
                    rows.push(
                        <Row className="inbox-open-conversation" key={i} 
                            onClick={()=> 
                                this.setState({
                                    currentConversationIndex: i,
                                    currentConversationID: this.props.conversations[i].conversationID,
                                    composingNewConvo: false
                                })
                            }>
                            <Col key={i} sm={12}>
                                ConversationID: {this.props.conversations[i].conversationID} {/* Gets the conversation ID */}
                                <br></br>Message from {this.state.users[this.state.users.findIndex((x:any) => x.userID == this.props.conversations[i].entries[0].userID)].displayName}
                                : <i>"{this.props.conversations[i].entries[0].text}"</i> {/* Gets the latest message as preview */}    
                            </Col>
                        </Row>
                    );
                }
                else {
                    rows.push(
                        <Row className="inbox-conversation" key={i}
                            onClick={()=> 
                                this.setState({
                                    currentConversationIndex: i,
                                    currentConversationID: this.props.conversations[i].conversationID,
                                    composingNewConvo: false
                                })
                            }>
                            <Col key={i} sm={12}>
                                ConversationID: {this.props.conversations[i].conversationID} {/* Gets the conversation ID */}
                                <br></br>Message from: {this.state.users[this.state.users.findIndex((x:any) => x.userID == this.props.conversations[i].entries[0].userID)].displayName}
                                : <i>"{this.props.conversations[i].entries[0].text}"</i> {/* Gets the latest message as preview */}   
                            </Col>
                        </Row>
                    );
                }
            }
        } else {
            rows.push(
            <Row key={0} className="inbox-no-message">
                <Col key={0} sm={12}>No conversations</Col>
            </Row>);
        }
        return rows;
    }

    /* 
    *   renderMessages:    renders the messages box of a conversation,
    *                   only renders/opens one conversation at a time,
    *                   Otherwise, converastion composer is default
    *                   (right window of inbox)
    */
    private readonly renderMessages = () => {

        if (this.state.composingNewConvo) {
            return [];
        }

        if (this.state.currentConversationIndex == null) {
            return [];
        }

        let rows = [];
        if (this.props.conversations != null && this.state.currentConversationIndex != null) {
            for (let i=this.props.conversations[this.state.currentConversationIndex].entries.length-1; i >= 0; i--) { 
                if (this.props.conversations[this.state.currentConversationIndex].entries[i].userID == this.props.userID) {
                    rows.push(
                        <Row key={i} className="inbox-message-row">
                            <Col className="inbox-my-message-bubble" sm="auto">
                                {this.props.conversations[this.state.currentConversationIndex].entries[i].text}
                            </Col>
                        </Row>
                    );
                }
                else if (this.state.users != null) {
                    rows.push(
                        <Row key={i} className="inbox-message-row">
                            <Col className="inbox-other-message-bubble" sm="auto">
                                {this.props.conversations[this.state.currentConversationIndex].entries[i].text}
                            </Col>
                            <Col className="inbox-message-bubble-name-tag" sm={12}>
                                {this.state.users[this.state.users.findIndex((x:any) => x.userID == this.props.conversations[this.state.currentConversationIndex!].entries[i].userID)].displayName}
                            </Col>
                        </Row>
                    );
                }
            }
        } else {
            rows.push(
            <Row key={0} className="inbox-no-message">
                <Col key={0} sm={12}>No messages</Col>
            </Row>);
        }
        return rows;
    }

    // /**
    //  * @override
    //  */
    // public shouldComponentUpdate(nextProps: Props, nextState: State) {
    //     if (nextProps != this.props) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

    public componentDidMount() {
        this.getUsers().then(() => console.log("All users: ", this.state.users));
        // Check for a query string and set the state appropriately
        const location = this.props.location;
        const values = queryString.parse(location.search);
        const conversationID = Number(values.conversationid) != null ? Number(values.conversationid) : undefined;
        // If a valid conversationID is found, search for the matching
        if (conversationID != null) {
            for (let i = 0; i < this.props.conversations.length; ++i) {
                // If we've found the conversation that matches this conversations, set state
                if (this.props.conversations[i].conversationID == conversationID) {
                    console.log("Index: ", i);
                    console.log("ID: ", this.props.conversations[i].conversationID);
                    this.setState({
                        currentConversationID: conversationID,
                        currentConversationIndex: i
                    });
                }
            }
        }
    }

    /**
     * @override
     */
    public async componentDidUpdate() {
        if  (this.state.currentConversationID) {
            const participantsMap = await this.props.getParticipants(this.state.currentConversationID);
            console.log("Participants Maps: ", participantsMap);
        }
    }

    /**
     * @override
     */
    public render(): ReactNode {
            /* 
            
            == Default view of inbox page ==
            for each convo where user is a participant of
                list last message and icon indication # of unseen messages

            == On press of any listed conversation == 
            for last 20 messages in convo
                sort messages by time stamp
                if user is me
                    print message right side
                else 
                    print message left side
            */
        let participents = this.renderParticipents();
        let conversations = this.renderInbox();
        let messages = this.renderMessages();

        return (

            <Container fluid className="inbox">

                <div className="inbox-compose-message">
                    <Form onSubmit={(e: any) => this.onCompose(e)}>
                        <Row>
                            <Col sm={12} ><Button className="inbox-compose-button" variant="primary" type="submit">Compose Message</Button></Col>
                        </Row>
                    </Form>
                </div>

                <div className="inbox-participents">
                    {participents}
                </div>

                <div className="inbox-conversations">
                    {conversations}
                </div>

                <div className="inbox-chat-box">
                    {messages}
                </div>

                <div className="inbox-text-box">
                    <Form onSubmit={(e: any) => this.onSend(e)}>
                        <Row>
                            <Col>
                                <Form.Control
                                    className="inbox-textField"
                                    onChange={(e: any) => this.onTextFieldChange(e)}
                                    type="text"
                                    value={this.state.textField}
                                    placeholder="Enter message..."
                                />
                            </Col>
                            <Col>
                                <Button variant="primary" type="submit">Send</Button>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </Container>
        );
    }
}
