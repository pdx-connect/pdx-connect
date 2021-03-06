import * as React from "react";
import Select from 'react-select';
import {Container, Row, Col, Form, Button} from "react-bootstrap";
import {Component, ReactNode} from "react";
import {RouteChildrenProps} from 'react-router';
import * as queryString from "query-string";
import {ConversationEntry} from "../Home";
import {getJSON} from '../../util/json';
import {ValueType} from "react-select/lib/types";
import {OptionType} from "../../components/types";

import "./Inbox.css";

interface Props extends RouteChildrenProps {
    sendMessage: (msg: string, conversationID: number|null, userID:number[]|null) => Promise<void>;
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
    currentParticipates?: string[];
    numOfConversations?: number;
}

/*
*   INBOX CLASS
*/
export class Inbox extends Component<Props, State> {
    
    /*
    *  CONSTRUCTOR
    */
    constructor(props: Props) {
        super(props);
        this.state = {
            textField: "",
            composingNewConvo: false,
            composingNewConvoParticipants: [],
            numOfConversations: this.props.conversations.length,
        }
    }

    /*
    *   Gets all the users 
    */
    private readonly getUsers = async () => {
        let data: any;
        data = await getJSON("/api/user/findnames");
        this.setState({users: data.results});
    };

    // Ref object for auto-scroll, used in render at chat-box
    private chatRef = React.createRef<HTMLDivElement>();

    /*
    *   Auto-scroll to bottom of chat using ref 
    */
    private readonly scrollChatToBottom = () => {
        if (this.chatRef.current) {
            this.chatRef.current.scrollTop = this.chatRef.current.scrollHeight;
        }
    };

    /*
    *   Message textfield state is updated on each keystroke
    */
    private readonly onTextFieldChange = (e: any) => {
        e.preventDefault();
        this.setState({textField: e.target.value});
        this.scrollChatToBottom(); // Auto scroll to bottom of chatbox
    };

    /*
    *   On send or ENTER key, sendMessage() broadcasts to socket
    *   message is sent
    */
    private readonly onSend = (e: any) => {
        e.preventDefault();

        // Composing new message
        if (this.state.composingNewConvo && this.state.textField != "" && this.state.composingNewConvoParticipants.length > 1 && this.state.composingNewConvoParticipants.includes(this.props.userID)) {
            this.props.sendMessage(this.state.textField, null, this.state.composingNewConvoParticipants);
            this.setState({
                composingNewConvoParticipants: [], // Clear participants array
                composingNewConvo: false,
                currentConversationIndex: 0, // Set the conversations index to most recent
                currentConversationID: this.props.conversations[0].conversationID // Set the respective ID
            });
        }
        else {
            console.log("Conversation not started!");
        }

        // Replying to existing message
        if (!this.state.composingNewConvo && this.state.currentConversationID && this.state.textField != "") {
            this.props.sendMessage(this.state.textField, this.state.currentConversationID, null).then();
        }
        this.setState({textField: ""});
    }

    /*
    *   onCompose:  On enter of compose button, a new
    *               conversation window is rendered
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
    */
    private readonly setParticipents = (e: ValueType<OptionType>) => {
        const selectedOptions: OptionType[] = OptionType.resolve(e);
        const value = [];

        for (let i = 0; i < selectedOptions.length; i++) {
            value.push(Number.parseInt(selectedOptions[i].value));
        }

        this.setState({composingNewConvoParticipants: value});
    }

    /* 
    *   renderParticipents:    renders the participants of a conversation,
    *                   only renders/opens one conversation at a time,
    *                   Otherwise, converastion composer is default
    *                   and this field is open for adding users to the conversation
    *                   (right-top window of inbox)
    */
    private readonly renderParticipents = () => {

        let users = []; // All PDX-connect users
        let rows = []; // Formatted for rendering

        // If in composingNewConvo state, will return a selection window of all users
        if (this.state.composingNewConvo) {

            if (this.state.users) {
                for(let i=0; i<this.state.users.length; i++) {
                    users.push({value: this.state.users[i].userID, label: this.state.users[i].displayName});
                }
            }

            let defaultVal: OptionType = {
                value: this.props.userID.toString(),
                label: this.state.users[this.state.users.findIndex((x:any) => x.userID == this.props.userID)].displayName
            };

            rows.push(
                <Select 
                    isMulti
                    defaultValue={defaultVal}
                    onChange={this.setParticipents}
                    options={users}
                    className="basic-multi-select inbox-participants-select"
                    classNamePrefix="select"
                />
            );

            let renderRows = []

            renderRows.push(
                <div className="inbox-participents">
                    {rows}
                </div>
            );
            return renderRows; // We must return, othewise unknown behaviour because of -1 convo index and ID
        }

        //
        // ELSE - will render the participants of an open conversation
        //

        // Formats commas, spacing and header
        if (this.props.conversations != null && this.state.currentParticipates != null) {
            for (let i=0; i<this.state.currentParticipates.length; i++) {
                rows.push(<li key={i} className="inbox-participant-name">{this.state.currentParticipates[i]}</li>);
            }
        }

        let renderRows = []

        renderRows.push(
            <div className="inbox-participents inbox-participants-scrollable">
                {rows}
            </div>
        );

        return renderRows;
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

        if (this.props.conversations != null && this.state.users != null) {
            for (let i=this.props.conversations.length-1; i>=0; i--) {
                if (i == this.state.currentConversationIndex) {
                    rows.push(
                        <Row className="inbox-open-conversation" key={i}>
                            <Col key={i} sm={12}>
                                ConversationID: {this.props.conversations[i].conversationID}
                                <br></br>{this.state.users[this.state.users.findIndex((x:any) => x.userID == this.props.conversations[i].entries[0].userID)].displayName}
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
                                ConversationID: {this.props.conversations[i].conversationID}
                                <br></br>{this.state.users[this.state.users.findIndex((x:any) => x.userID == this.props.conversations[i].entries[0].userID)].displayName}
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
                } else if (this.state.users != null) {
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

    /*
     *  ComponentDidMount
     */
    public componentDidMount() {
        this.getUsers().then();
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
     * ComponentDidUpdate
     * @override
     */
    public async componentDidUpdate(prevProps: Props, prevState: State) {

        // Auto scroll to bottom of chatbox is not composing
        if (!this.state.composingNewConvo) {
            this.scrollChatToBottom();
        }

        // Pull participants from the current open coversation and set state
        if (this.state.currentConversationID && prevState.currentConversationID != this.state.currentConversationID) {
            
            const participantsMap: Map<number, string>|undefined = await this.props.getParticipants(this.state.currentConversationID);
            let participants: string[];
            
            if (this.props.conversations != null && participantsMap != null) {
                participants = Array.from(participantsMap.values()).sort(); // Alphabetical sort for names
            } else {
                participants = [];
            }
            this.setState({
                currentParticipates: participants
            });
        }

        // Sets the last composed conversation as active
        if (this.state.numOfConversations != this.props.conversations.length) {
            this.setState({
                currentConversationIndex: this.props.conversations.length-1,
                currentConversationID: this.props.conversations[this.props.conversations.length-1].conversationID,
                numOfConversations: this.props.conversations.length
            });
        }
    }

    /**
     * @override
     */
    public render(): ReactNode {

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

                    {participents}

                <div className="inbox-conversations">
                    {conversations}
                </div>

                <div className="inbox-chat-box" ref={this.chatRef}>
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
