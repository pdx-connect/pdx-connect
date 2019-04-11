import * as React from "react";
import {Container, Row, Col, Form, Button} from "react-bootstrap";
import {Component, ReactNode} from "react";
//import {ConversationEntry} from "./Home";


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
                text: "A am David!",
                seen: false
            },
            {
                userID: 4,
                timeSent: 1555011175,
                text: "I am Daniel",
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
            rows.push( <Row className="convo-id"> ConversationID: {conversations[i].conversationID} 
                <Col>  </Col>
            
            </Row> );
            for (let j=0; j<conversations[i].messages.length; j++) {
                {conversations[i].messages[j]}
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

            let inbox = this.getInbox();

        return (

            <Container fluid className="inbox">
                {inbox}
            </Container>
        );
    }

}