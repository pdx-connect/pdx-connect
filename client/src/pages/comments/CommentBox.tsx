import * as React from "react";
import {Container, Row, Col, Button, Form} from "react-bootstrap";
import {Component, ReactNode} from "react";
import {Comment} from "./Comment"
import {RouteChildrenProps} from "react-router";
import { postJSON, getJSON } from '../../util/json';
/**
 * Component usage
 *  <Row>
        <CommentBox type="listing|event" id={##} history={this.props.history} match={this.props.match} location={this.props.location}></CommentBox>
    </Row>
 */

// Comment format, used to communicate between client and server
interface CommentFormat {
    id: number,
    userID: number,
    displayName: string,
    timePosted: Date,
    content: string
}

// Properties passed in from parent
interface Props extends RouteChildrenProps {
    type: "event"|"listing";
    id: number;
}

// State, necessary for component operation
interface State {
    commentText: string;
    comments: CommentFormat[];
/*    names: {
        [keys: number]: string
    };*/
}

/**
 * 
 */
export class CommentBox extends Component<Props, State> {
    // Constructor - simply initializes the commentText to empty string
    constructor(props: Props) {
        super(props);
        this.state = {
            commentText: "",
            comments: [], 
            //names: {}
        };
    };

    // Runs when the submit event is triggered to send a new comment

    private readonly submitComment = async (e: any) => {
        e.preventDefault();

        console.log("Trying to submit comment: " + this.state.commentText);
        // Ensure that there is a comment to send
        if (this.state.commentText != "") {
            // Format the middle portion of the server route
            let middle: string = this.props.type + "/" + this.props.id;

            // Send the comment to the server
            await postJSON("/api/" + middle + "/comment", {content: this.state.commentText});
            // Reset the commentText field
            this.setState({commentText: ""});
            this.fetchComments();
        } else {
            console.error("No comment text");
        }
    };

    // When user enters text in the form component, 
    private readonly onTextChange = (e: any) => {
        e.preventDefault();
        this.setState({commentText: e.target.value});
    };

    // Renders the actual comments themselves
    private readonly renderComments = () => {
        let toRender = [];
        // Render the comments
        for (let i = 0; i < this.state.comments.length; ++i) {
            toRender.push(
                <Row>
                    <Comment comment={this.state.comments[i]} key={this.state.comments[i].id} history={this.props.history} match={this.props.match} location={this.props.location}></Comment>
                </Row>
            );
        }
        return toRender;
    };

    // Renders a form for comment text and a submit button
    private readonly renderBottom = () => {
        // Render Text Box
        return (
        <div className="text-box">
            <Form onSubmit={(e: any) => this.submitComment(e)}>
                <Row>
                    <Col>
                        <Form.Control
                            className="comment-text"
                            onChange={(e: any) => this.onTextChange(e)}
                            type="text"
                            value={this.state.commentText}
                            placeholder="Enter comment..."
                        />
                    </Col>
                    <Col>
                        <Button variant="primary" type="submit">Send</Button>
                    </Col>
                </Row>
            </Form>
        </div>)

    }

    // Fetches comments from the server based on which type of object these comments
    //   belong to, and that object's ID
    private readonly fetchComments = async () => {
        // Format the middle portion of the server route
        let middle: string = this.props.type + '/' + this.props.id;
        // Request the comments for this box from the server
        let comments: CommentFormat[] = await getJSON("/api/" + middle + "/comments");
        if (comments.length == null) {
            console.error("Comments from server aren't in expected format");
            throw comments;
        }

        // Set the state
        this.setState({
            comments: comments,
            //names: names
        });
        console.log(this.state.comments);
    }

    /**
     * @override
     */
    public componentDidMount = async () => {
        this.fetchComments();
    }
    
    /**
     * @override
     */
    public render(): ReactNode {
        return ( 
            <Container fluid className='comment-box'>
                <div>
                    {this.renderComments()}
                </div>
                <div>
                    {this.renderBottom()}
                </div>
            </Container>
        );
    }
}