import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Table} from "react-bootstrap";
import {FaUser} from "react-icons/fa";

import "./Profile.css";

interface Props {
    userID: Number;
}

interface State {
}


/**
 * 
 */
export class ProfileContent extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    public render(): ReactNode {
        
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
                                        <td className="profile-display-name">displayname</td>
                                    </tr>
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
                                        <td>major content</td>
                                    </tr>
                                    <tr>
                                        <td>commuter</td>
                                    </tr>
                                    <tr>
                                        <td>commuter content</td>
                                    </tr>
                                    <tr>
                                        <td>about me</td>
                                    </tr>
                                    <tr>
                                        <td>about me content</td>
                                    </tr>
                                    <tr>
                                        <td>interests</td>
                                    </tr>
                                    <tr>
                                        <td>interests content</td>
                                    </tr>
                                </tbody>
                                </Table>
                        </Col>
                    </Row>
                </Container>

        );
    }

}