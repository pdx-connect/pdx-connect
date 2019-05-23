import * as React from "react";
import {Container, Row, Col} from "react-bootstrap";
import {Component, ReactNode} from "react";
import {RouteChildrenProps} from "react-router";
import {CommentFormat} from "./CommentFormat";


interface Props extends RouteChildrenProps {
    key: number;
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
        this.state = {};
    }

    private readonly onClick = () => {
        let profilePath = "/profile/" + this.props.comment.userID;
        this.props.history.push(profilePath);
    };
    
    /**
     * @override
     */
    public render(): ReactNode {
        return (
            <Container>
                <Row>-----</Row>
                <Row className='comment-user-and-timestamp'>
                    <Col className='comment-user' onClick={this.onClick}> {this.props.comment.displayName} </Col>
                    <Col className='comment-timestamp'>{this.props.comment.timePosted}</Col>
                </Row>
                <Row className='comment-body'>
                    <Col className='comment-text'>{this.props.comment.content}</Col>
                </Row>
            </Container>
        );
    }

}
