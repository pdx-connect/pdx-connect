import * as React from "react";
import {Container, Row, Col, Button} from "react-bootstrap";
import {Component, ReactNode} from "react";
 
interface CommentFormat {
    id: number,
    userID: number,
    timePosted: Date,
    content: string
}

interface Props {
    comment: CommentFormat;
}

interface State {
}

/**
 * 
 */
export class Comment extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

  
    
    /**
     * @override
     */
    public render(): ReactNode {

        return (
            <Container>
                <Row className='comment-user-and-timestamp'>
                    <Col className='comment-user'>{this.props.comment.userID}</Col>
                    <Col className='comment-timestamp'>{this.props.comment.timePosted}</Col>
                </Row>
                <Row className='comment-body'>
                    <Col className='comment-text'>{this.props.comment.content}</Col>
                </Row>
            </Container>
        );
    }

}