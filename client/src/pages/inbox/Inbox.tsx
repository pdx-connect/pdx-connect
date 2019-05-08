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
    getParticipants: (conversationID: number) => Promise<Map<number, string>|undefined>;
}

interface State {
    currentConversationIndex?: number;
    currentConversationID?: number;
    textField: string;
    composingNewConvo: boolean;
}

/**
 * 
 */
export class Inbox extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            textField: "",
            composingNewConvo: false,
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
    private readonly onSubmit = (e: any) => {
        e.preventDefault();

        if (this.state.currentConversationID && this.state.textField != "") {
            this.props.sendMessage(this.state.textField, this.state.currentConversationID, null);
        }
        this.setState({textField: ""});
    }
    /*
    *   On enter of compose button, a new conversation window is rendered
    *   
    */
    private readonly onCompose = () => {
        
    
    }

    /* 
    *   getMessages:    renders the participants of a conversation,
    *                   only renders/opens one conversation at a time,
    *                   Otherwise, converastion composer is default
    *                   and this field is open for adding users to the conversation
    *                   (right-top window of inbox)
    */
    private readonly getParticipents = () => {
        let rows = [];

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
    *   getInbox:   renders the selectable list of conversations the user is a part of, 
    *               along with a prewview of the lastest message
    *               (left window of inbox)
    */
    private readonly getInbox = () => {
        let rows = [];
        if (this.props.conversations != null) {
            for (let i=0; i<this.props.conversations.length; i++) {
                if (i == this.state.currentConversationIndex) {
                    rows.push(
                        <Row key={i} onClick={()=> this.setState({currentConversationIndex: i, currentConversationID: this.props.conversations[i].conversationID})} className="open-conversation">
                            <Col key={i} sm={12}>
                                Message from: User {this.props.conversations[i].entries[0].userID} {/* Gets the latest message sender */}
                                Preview: {this.props.conversations[i].entries[0].text} {/* Gets the latest message as preview */}    
                            </Col>
                        </Row>
                    );
                }
                else {
                    rows.push(
                        <Row key={i} onClick={()=> this.setState({currentConversationIndex: i, currentConversationID: this.props.conversations[i].conversationID})} className="conversation">
                            <Col key={i} sm={12}>
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
    *   getMessages:    renders the messages box of a conversation,
    *                   only renders/opens one conversation at a time,
    *                   Otherwise, converastion composer is default
    *                   (right window of inbox)
    */
    private readonly getMessages = () => {

        if (this.state.currentConversationIndex == null) {
            return [];
        }
        let rows = [];
        if (this.props.conversations != null && this.state.currentConversationIndex != null) {
            //console.log("Convo 0" ,this.props.conversations[0])
            for (let i=this.props.conversations[this.state.currentConversationIndex].entries.length-1; i >= 0; i--) { 
                if (this.props.conversations[this.state.currentConversationIndex].entries[i].userID == this.props.userID) {
                    rows.push(
                        <Row key={i} className="my-message">
                            <Col className="my-message-bubble" key={i} sm="auto"> {this.props.conversations[this.state.currentConversationIndex].entries[i].text}</Col>
                        </Row>
                    );
                }
                else {
                    rows.push(
                        <Row key={i} className="other-message">
                            <Col className="other-message-bubble" key={i} sm="auto"> {this.props.conversations[this.state.currentConversationIndex].entries[i].text}</Col>
                            <Col className="message-bubble-name-tag" key={i} sm={12}>UserID: {this.props.conversations[this.state.currentConversationIndex].entries[i].userID}</Col>
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
        let participents = this.getParticipents();
        let conversations = this.getInbox();
        let messages = this.getMessages();

        return (

            <Container fluid className="inbox">

                <div className="compose-message">
                    <Form onSubmit={(e: any) => this.onSubmit(e)}>
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
                    <Form onSubmit={(e: any) => this.onSubmit(e)}>
                        <Row>
                            <Col><Form.Control onChange={(e: any) => this.onChange(e)} type="text" value={this.state.textField} placeholder="Enter message..."/></Col>
                            <Col><Button variant="primary" type="submit">Send</Button></Col>
                        </Row>
                    </Form>
                </div>
            </Container>
        );
    }
}