import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Table, Button, Modal} from "react-bootstrap";
import {FaUser} from "react-icons/fa";
import {postJSON} from "../../util/json";
import queryString from "query-string";
import "./Profile.css";

interface Props {
    displayProfile: Profile
}

interface State {
    showComposeMessage: boolean
}

interface Profile {
    [key: string]: any;
}

/**
 * 
 */
export class ProfileContent extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            showComposeMessage: false
        };
    }

    public render(): ReactNode {
        console.log('profilecontent: ', this.props.displayProfile);

        let name = this.props.displayProfile.displayName ? this.props.displayProfile.displayName : "";
        let major = this.props.displayProfile.major ? this.props.displayProfile.major: "";
        let commuterStatus = this.props.displayProfile.commuterStatus ? this.props.displayProfile.commuterStatus: "";
        let aboutMe = this.props.displayProfile.description ? this.props.displayProfile.description: "";
        let interests = this.props.displayProfile.tags ? this.props.displayProfile.tags: "";
        let isUser = this.props.displayProfile.isUser ? this.props.displayProfile.isUser: false;

        return (
                <Container fluid className="profile-content">
                    <Row> 
                        <Col sm={3}>
                        <Table className="text-center profile-user-profile-img-table">
                                <tbody>
                                    <tr>
                                        <td><span className="profile-user-img"><FaUser size="8vw" className="profile-user-img-placeholder"></FaUser></span></td>
                                    </tr>
                                    <tr>
                                        <td className="profile-display-name">{name}</td>
                                    </tr>
                                    { isUser === true ? null :
                                        <tr>
                                            <td><Button size="sm" variant="light" className="profile-message-me-button" onClick={() => this.setState({ showComposeMessage: true })}>message me</Button></td>
                                        </tr>
                                    }
                                </tbody>
                                </Table>
                        </Col>
                        <Col sm={1}></Col>
                        <Col sm={8}>
                            <Table className="profile-user-profile-table">
                                <tbody>
                                    <tr>
                                        <td>major</td>
                                    </tr>
                                    <tr>
                                        <td>{major}</td>
                                    </tr>
                                    <tr>
                                        <td>commuter</td>
                                    </tr>
                                    <tr>
                                        <td>{commuterStatus}</td>
                                    </tr>
                                    <tr>
                                        <td>about me</td>
                                    </tr>
                                    <tr>
                                        <td>{aboutMe}</td>
                                    </tr>
                                    <tr>
                                        <td>interests</td>
                                    </tr>
                                    <tr>
                                        <td>{interests}</td>
                                    </tr>
                                </tbody>
                                </Table>
                        </Col>
                    </Row>
                    { isUser === true ? null :
                        <Modal size="lg" show={this.state.showComposeMessage} onHide={() => this.setState({ showComposeMessage: false })} dialogClassName="profile-compose-message-modal" backdrop="static">
                            <Modal.Header closeButton><h4>Hey {name}!</h4></Modal.Header>
                            <Modal.Body>message</Modal.Body>
                            <Modal.Footer>
                            </Modal.Footer>
                        </Modal>
                    }
                </Container>

        );
    }

}