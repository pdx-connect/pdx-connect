import * as React from "react";
import {Container, Row, Col, Form, Button} from "react-bootstrap";
import {Component, ReactNode} from "react";
//import {ConversationEntry} from "./Home";

import "./Inbox.css";


interface Props {
    sendMessage: (conversationID: number, msg: string) => void;
    getMoreMessages: (conversationID: number) => void;
    seenRecent: (conversationID: number, time: number) => void;
//    conversations: ConversationEntry[];
    newMessageCount: number;
}

interface State {
}

const conversations = [
    {   
        conversationID: 100,
        lastSeen: 1555011969, // epoch
        messages: [
            {
                userID: 6,
                timeSent: 1555011169,
                text: "I am David!",
                seen: false
            },
            {
                userID: 4,
                timeSent: 1555011175,
                text: "I am Daniel!",
                seen: false
            },
            {
                userID: 6,
                timeSent: 1555011179,
                text: "Whats up?",
                seen: false
            },
            {
                userID: 4,
                timeSent: 1555011186,
                text: "Nothing much",
                seen: false
            },
            {
                userID: 6,
                timeSent: 1555011197,
                text: "Are you actually Daniel?",
                seen: false
            },
            {
                userID: 4,
                timeSent: 1555011201,
                text: "Nah I'm David lol",
                seen: false
            },
            {
                userID: 6,
                timeSent: 1555011210,
                text: "Ah, you got me for a sec",
                seen: false
            },
            {
                userID: 6,
                timeSent: 1555011220,
                text: "Why are you like this?",
                seen: false
            }
        ]
    },
    {   
        conversationID: 101,
        lastSeen: 1555011959, // epoch
        messages: [
            {
                userID: 1,
                timeSent: 1555011169,
                text: "I am user 1",
                seen: false
            },
            {
                userID: 2,
                timeSent: 1555011175,
                text: "I am user 2",
                seen: false
            }
        ]
    }
];



/**
 * 
 */
export class Inbox extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
    }
    
    private readonly getInbox = () => {
        let rows = [];
        for (let i=0; i<conversations.length; i++) {
            rows.push(
                <Row className="conversation">
                    <Col sm={6} >Message from: user {conversations[i].messages[0].userID}</Col>
                    <Col sm={6} >{conversations[i].messages[conversations[i].messages.length-1].text}</Col>
                </Row>
            );
        }
        return rows;
    }

    private readonly getMessages = () => {
        let rows = [];
        for (let i=0; i<conversations[0].messages.length; i++) {
            if (conversations[0].messages[i].userID == 6) {
                 rows.push(
                      <Row className="my-message">
                        <Col sm={12} > {conversations[0].messages[i].text}</Col>
                      </Row>
                );
            }
            else {
                rows.push(
                    <Row className="other-message">
                      <Col sm={12} > {conversations[0].messages[i].text}</Col>
                    </Row>
              );
            }
        }
        return rows;
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

            let conversations = this.getInbox();
            let messages = this.getMessages();

        return (

            <Container fluid className="inbox">
                <div className="conversations">
                    {conversations}
                </div>
                <div className="chat-box">
                    {messages}
                </div>
            </Container>
        );
    }

}