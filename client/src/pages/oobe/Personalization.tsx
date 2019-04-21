import * as React from "react";
import {Component} from "react";
import {Container, Row, Col, Modal} from "react-bootstrap";
import Switch from 'react-switch';
import "./Profile.css";
import { FaInfo } from "react-icons/fa";

import {Tags} from "./preferences/Tags";
import {Profile} from "./preferences/Profile";
import {Miscellaneous} from "./preferences/Miscellaneous";
import {Messages} from "./preferences/Messages";
import {Comments} from "./preferences/Comments";

const modalContent: { [key: string]: typeof Component } = {
    "profile": Profile,
    "tags": Tags,
    "miscellaneous": Miscellaneous,
    "messages": Messages,
    "comments": Comments
};

const modalTitle: { [key: string]: keyof Personalizations } = {
    "profile": 'profile',
    "tags": 'tags',
    "miscellaneous": 'miscellaneous',
    "messages": 'messages',
    "comments": 'comments'
};

export interface Personalizations {
    profile: boolean;
    tags: boolean;
    miscellaneous: boolean;
    messages: boolean;
    comments: boolean;
}

interface Props {
    handlePersonalizationCheck: (
        checked: boolean,
        event: React.SyntheticEvent<MouseEvent | KeyboardEvent> | MouseEvent,
        id: keyof Personalizations
    ) => void;
    personalizations: Personalizations;
}

interface State {
    show: boolean;
    modal: keyof Personalizations;
}

export class Personalization extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            show: false,
            modal: "profile"
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

    private readonly setInformation = (e: keyof Personalizations) => {
        this.setState({
            show: true,
            modal: e
        })
    };

    /**
     * @override
     */
    public render() {
        const {personalizations} = this.props;

        const handlePersonalizationCheck = (checked: boolean,
                                            event: React.SyntheticEvent<MouseEvent | KeyboardEvent> | MouseEvent,
                                            id: string) => {
            if (modalTitle[id] != null) {
                this.props.handlePersonalizationCheck(checked, event, modalTitle[id]);
            }
        };

        const CurrentContent = modalContent[this.state.modal];
        const title = modalTitle[this.state.modal];

        return (
            <Container fluid className="personalization">
                <Row className="personalizationRowTitle">
                    <Col md={4} className="personalizationTitle">privacy</Col>
                    <Col md={8}></Col>
                </Row>

                <Row className="personalizationRow">
                    <Col md={4} className="switch"><Switch id="profile" onChange={handlePersonalizationCheck}
                                                           checked={personalizations.profile}/></Col>
                    <Col md={6} className="switchTitle">profile</Col>
                    <Col md={2}><FaInfo className="information" onClick={()=>this.setInformation("profile")}/></Col>
                </Row>

                <Row className="personalizationRowTitle">
                    <Col md={4} className="personalizationTitle">email forwarding</Col>
                    <Col md={8}></Col>
                </Row>

                <Row className="personalizationRow">
                    <Col md={4} className="switch"><Switch id="tags" onChange={handlePersonalizationCheck}
                                                           checked={personalizations.tags}/></Col>
                    <Col md={6} className="switchTitle">tags</Col>
                    <Col md={2}><FaInfo className="information" onClick={()=>this.setInformation("tags")}/></Col>
                </Row>

                <Row className="personalizationRow">
                    <Col md={4} className="switch"><Switch id="miscellaneous" onChange={handlePersonalizationCheck}
                                                           checked={personalizations.miscellaneous}/></Col>
                    <Col md={6} className="switchTitle">miscellaneous</Col>
                    <Col md={2}><FaInfo className="information" onClick={()=>this.setInformation("miscellaneous")}/></Col>
                </Row>

                <Row className="personalizationRow">
                    <Col md={4} className="switch"><Switch id="messages" onChange={handlePersonalizationCheck}
                                                           checked={personalizations.messages}/></Col>
                    <Col md={6} className="switchTitle">messages</Col>
                    <Col md={2}><FaInfo className="information" onClick={()=>this.setInformation("messages")}/></Col>
                </Row>

                <Row className="personalizationRow">
                    <Col md={4} className="switch"><Switch id="comments" onChange={handlePersonalizationCheck}
                                                           checked={personalizations.comments}/></Col>
                    <Col md={6} className="switchTitle">comments</Col>
                    <Col md={2}><FaInfo className="information" onClick={()=>this.setInformation("comments")}/></Col>
                </Row>

                <Modal show={this.state.show} onHide={this.handleClose} className="info-modal" size="lg">
                    <Modal.Header>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body><CurrentContent/></Modal.Body>
                    <Modal.Footer></Modal.Footer>
                </Modal>
            </Container>
        );
    }

}
