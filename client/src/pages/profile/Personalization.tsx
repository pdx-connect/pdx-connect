import * as React from "react";
import {Component} from "react";
import {Container, Row, Col, Modal} from "react-bootstrap";
import Switch from 'react-switch';
import "../Register.css";
import { FaInfo } from "react-icons/fa";

// TODO: moved out of register, put this back together
/*
handleInterestChange={this.handleInterestChange}
handlePersonalizationCheck={this.handlePersonalizationCheck}
selectedOption={this.state.selectedOption}
personalizations={this.state.personalizations}
            selectedOption: null,
            personalizations: {
                "profile": true,
                "tags": true,
                "notifications": true,
                "messages": true,
                "comments": true
            },
private readonly handleInterestChange = (selectedOption: string) => {
this.setState({selectedOption});
};

private readonly handlePersonalizationCheck = (checked: boolean, event: object, id: any) => {
    let personalizations = this.state.personalizations;
    personalizations[id] = checked;
    this.setState({
        personalizations: personalizations
    });
};
*/

interface Props {
    handlePersonalizationCheck: (
        checked: boolean,
        event: React.SyntheticEvent<MouseEvent | KeyboardEvent> | MouseEvent,
        id: string
    ) => void;
    personalizations: { [id: string]: boolean };
}

interface State {
    show: boolean;
}

export class Personalization extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            show: false
        };
    }
    
    private readonly handleClose = () => {
        this.setState({
            show: false
        })
    };

    private readonly handleShow = () => {
        this.setState({
            show: true
        })
    };

    /**
     * @override
     */
    public render() {
        const {handlePersonalizationCheck, personalizations} = this.props;

        return (
            <Container fluid className="personalization">
                <Row className="personalizationRowTitle">
                    <Col md={2} className="personalizationTitle">privacy</Col>
                    <Col md={4}></Col>
                    <Col md={2} className="personalizationTitle">notifications</Col>
                    <Col md={4}></Col>
                </Row>
                <Row className="personalizationRow">
                    <Col md={2} className="switch"><Switch id="profile" onChange={handlePersonalizationCheck}
                                                           checked={personalizations["profile"]}/></Col>
                    <Col md={4} className="switchTitle">Profile<FaInfo className="information"
                                                                       onClick={this.handleShow}/></Col>
                    <Col md={2} className="switch"><Switch id="tags" onChange={handlePersonalizationCheck}
                                                           checked={personalizations["tags"]}/></Col>
                    <Col md={4} className="switchTitle">Tags<FaInfo className="information" onClick={this.handleShow}/></Col>
                </Row>
                <Row className="personalizationRow">
                    <Col md={2}></Col>
                    <Col md={4}></Col>
                    <Col md={2} className="switch"><Switch id="notifications" onChange={handlePersonalizationCheck}
                                                           checked={personalizations["notifications"]}/></Col>
                    <Col md={4} className="switchTitle">Notifications<FaInfo className="information"
                                                                             onClick={this.handleShow}/></Col>
                </Row>
                <Row className="personalizationRow">
                    <Col md={2}></Col>
                    <Col md={4}></Col>
                    <Col md={2} className="switch"><Switch id="messages" onChange={handlePersonalizationCheck}
                                                           checked={personalizations["messages"]}/></Col>
                    <Col md={4} className="switchTitle">Messages<FaInfo className="information"
                                                                        onClick={this.handleShow}/></Col>
                </Row>
                <Row className="personalizationRow">
                    <Col md={2}></Col>
                    <Col md={4}></Col>
                    <Col md={2} className="switch"><Switch id="comments" onChange={handlePersonalizationCheck}
                                                           checked={personalizations["comments"]}/></Col>
                    <Col md={4} className="switchTitle">Comments<FaInfo className="information"
                                                                        onClick={this.handleShow}/></Col>
                </Row>

                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Personalization Information</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Display information about this personalization setting</Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }

}
