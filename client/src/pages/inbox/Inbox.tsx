import * as React from "react";
import {Container, Row, Col, Form, FormControl, Button} from "react-bootstrap";
import {Component, ReactNode} from "react";

import {Message, ConversationEntry} from "../Home";

import "./Inbox.css";


interface Props {
    sendMessage: (msg: string, conversationID: number|null, userID:number[]|null) => void;
    getMoreMessages: (conversationID: number) => void;
    seenRecent: (conversationID: number, time: Date) => void;
    conversations: ConversationEntry[];
    userID: number;
    getParticipants: (conversationID: number) => Promise<Map<number, string>|undefined>;
}

interface State {
    currentConversation?: number;
    currentConversationID?: number;
    textField: string;
}

/**
 * 
 */
export class Inbox extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            textField: "",
        }
    }

    private readonly onChange = (e: any) => {
        e.preventDefault();
        this.setState({textField: e.target.value});
    }

    private readonly onSubmit = (e: any) => {
        e.preventDefault();

        if (this.state.currentConversationID) {
            this.props.sendMessage(this.state.textField, this.state.currentConversationID, null);
        }
        this.setState({textField: ""});
        
        //this.props.onSendMessage(this.state.textField)
    }

    private readonly getInbox = () => {
        let rows = [];
        if (this.props.conversations != null) {
            for (let i=0; i<this.props.conversations.length; i++) {
                if (i == this.state.currentConversation) {
                    rows.push(
                        <Row key={i} onClick={()=> this.setState({currentConversation: i, currentConversationID: this.props.conversations[i].conversationID})} className="open-conversation">
                            <Col key={i} sm={12}>
                                Message from: user {this.props.conversations[i].entries[0].userID}
                                Preview: {this.props.conversations[i].entries[this.props.conversations[i].entries.length-1].text}
                            </Col>
                        </Row>
                    );
                }
                else {
                    rows.push(
                        <Row key={i} onClick={()=> this.setState({currentConversation: i, currentConversationID: this.props.conversations[i].conversationID})} className="conversation">
                            <Col key={i} sm={12}>
                                Message from: user {this.props.conversations[i].entries[0].userID}
                                Preview: {this.props.conversations[i].entries[this.props.conversations[i].entries.length-1].text}
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

    private readonly getMessages = () => {
        if (this.state.currentConversation == null) {
            return [];
        }
        let rows = [];
        if (this.props.conversations != null) {
            for (let i=0; i<this.props.conversations[this.state.currentConversation].entries.length; i++) {
                if (this.props.conversations[0].entries[i].userID == this.props.userID) {
                    rows.push(
                        <Row key={i} className="my-message">
                            <Col key={i} sm={12}> {this.props.conversations[this.state.currentConversation].entries[i].text}</Col>
                        </Row>
                    );
                }
                else {
                    rows.push(
                        <Row key={i} className="other-message">
                            <Col key={i} sm={12}> {this.props.conversations[this.state.currentConversation].entries[i].text}</Col>
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
        let messages = this.getMessages();
        let conversations = this.getInbox();

        return (

            <Container fluid className="inbox">
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