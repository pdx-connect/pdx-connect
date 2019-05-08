import * as React from "react";
import {Container, Row, Col, Form, FormControl, Button} from "react-bootstrap";
import {Component, ReactNode} from "react";
import {Message, ConversationEntry} from "../Home";
import "./Inbox.css";
import { number } from 'prop-types';


interface Props {
    sendMessage: (msg: string, conversationID: number|null, userID:number[]|null) => void;
    getMoreMessages: (conversationID: number) => void;
    seenRecent: (conversationID: number, time: Date) => void;
    conversations: ConversationEntry[];
    userID: number;
}

interface State {
    currentConversationIndex?: number;
    currentConversationID?: number;
    textField: string;
    composingNewConvo: boolean;
    composingNewConvoParticipants: number[];
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

    /*
    *   Message textfield state is updated on each keystroke
    */
    private readonly onChange = (e: any) => {
        e.preventDefault();
        this.setState({textField: e.target.value});
    }

    /*
    *   On send or ENTER key, sendMessage() broadcasts to socket
    *   message is sent
    */
    private readonly onSend = (e: any) => {
        e.preventDefault();

        if (this.state.composingNewConvo && this.state.textField != "") {
            console.log("Sending message! with Participants: ", this.state.composingNewConvoParticipants);
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
        //this.setState({composingNewConvoParticipants: []}); // Clear participants array

        var options = e.target.options;
        var value = [];

        for (var i = 0, len = options.length; i < len; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        //console.log("Value array: ", value);
        this.setState({composingNewConvoParticipants: value});
        //console.log("State array: ", this.state.composingNewConvoParticipants);
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

        // If in composingNewConvo state, will return a selection window of all users
        if (this.state.composingNewConvo) {

            // DOTO: Add stuff here to pull all users
            rows.push(
                <Form className="user-select-form">
                    <Form.Control as="select" multiple className="user-select" onChange={(e: any) => this.setParticipents(e)}> 
                        <option value="1">Bradley - 1</option>
                        <option value="2">Brooke - 2</option>
                        <option value="3">Lee - 3</option>
                        <option value="4">Daniel - 4</option>
                        <option value="6">David - 6</option>
                        <option value="9">Ivan - 9</option>
                        <option value="10">Doanh - 10</option>
                        <option value="26">Hannah - 26</option>
                        <option value="38">Terry - 38</option>
                    </Form.Control>
                </Form>
            );
            return rows; // We must return, othewise unknown behaviour because of -1 convo index and ID
        }

        var participents: number[] = [];

        if (this.props.conversations != null && this.state.currentConversationIndex != null) {
            for (let i=0; i<this.props.conversations[this.state.currentConversationIndex].entries.length; i++) {
                if (participents.indexOf(this.props.conversations[this.state.currentConversationIndex].entries[i].userID) == -1) {
                    participents.push(this.props.conversations[this.state.currentConversationIndex].entries[i].userID);
                }         
            }
        }
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
                <Row className="open-conversation" key={-1}>
                    <Col key={-1} sm={12}>
                        Starting new conversation...
                    </Col>
                </Row>
            );
        }

        if (this.props.conversations != null) {
            for (let i=0; i<this.props.conversations.length; i++) {
                if (i == this.state.currentConversationIndex) {
                    rows.push(
                        <Row className="open-conversation" key={i} 
                            onClick={()=> 
                                this.setState({
                                    currentConversationIndex: i,
                                    currentConversationID: this.props.conversations[i].conversationID,
                                    composingNewConvo: false
                                })
                            }>
                            <Col key={i} sm={12}>
                                ConversationID: {this.props.conversations[i].conversationID} {/* Gets the conversation ID */}
                                Message from: User {this.props.conversations[i].entries[0].userID} {/* Gets the latest message sender */}
                                Preview: {this.props.conversations[i].entries[0].text} {/* Gets the latest message as preview */}    
                            </Col>
                        </Row>
                    );
                }
                else {
                    rows.push(
                        <Row className="conversation" key={i}
                            onClick={()=> 
                                this.setState({
                                    currentConversationIndex: i,
                                    currentConversationID: this.props.conversations[i].conversationID,
                                    composingNewConvo: false
                                })
                            }>
                            <Col key={i} sm={12}>
                                ConversationID: {this.props.conversations[i].conversationID} {/* Gets the conversation ID */}
                                Message from: User {this.props.conversations[i].entries[0].userID} {/* Gets the latest message sender */}
                                Preview: {this.props.conversations[i].entries[0].text} {/* Gets the latest message as preview */}
                            </Col>
                        </Row>
                    );
                }
            }
        } else {
            rows.push(
            <Row key={0} className="no-message">
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
                        <Row key={i} className="my-message">
                            <Col className="my-message-bubble" sm="auto">
                                {this.props.conversations[this.state.currentConversationIndex].entries[i].text}
                            </Col>
                        </Row>
                    );
                }
                else {
                    rows.push(
                        <Row key={i} className="other-message">
                            <Col className="other-message-bubble" sm="auto">
                                {this.props.conversations[this.state.currentConversationIndex].entries[i].text}
                            </Col>
                            <Col className="message-bubble-name-tag" sm={12}>
                                UserID: {this.props.conversations[this.state.currentConversationIndex].entries[i].userID}
                            </Col>
                        </Row>
                    );
                }
            }
        } else {
            rows.push(
            <Row key={0} className="no-message">
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

                <div className="compose-message">
                    <Form onSubmit={(e: any) => this.onCompose(e)}>
                        <Row>
                            <Col sm={12} ><Button className="compose-button" variant="primary" type="submit">Compose Message</Button></Col>
                        </Row>
                    </Form>
                </div>

                <div className="participents">
                    {participents}
                </div>

                <div className="conversations">
                    {conversations}
                </div>

                <div className="chat-box">
                    {messages}
                </div>

                <div className="text-box">
                    <Form onSubmit={(e: any) => this.onSend(e)}>
                        <Row>
                            <Col>
                                <Form.Control
                                    className="textField"
                                    onChange={(e: any) => this.onChange(e)}
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