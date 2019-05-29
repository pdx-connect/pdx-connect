import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Modal} from "react-bootstrap";
import {FaComment} from "react-icons/fa";
import Select from 'react-select';
import "./Profile.css";

interface Props {
    displayProfile: Profile;
    getUserProfileDefault: () => string;
}

interface State {
    showComposeMessage: boolean;
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
            showComposeMessage: false,
        };
    }

    public render(): ReactNode {
        let displayName = this.props.displayProfile.displayName ? this.props.displayProfile.displayName : "";
        let major = this.props.displayProfile.major ? this.props.displayProfile.major: "";
        let commuterStatus = this.props.displayProfile.commuterStatus ? this.props.displayProfile.commuterStatus: "";
        let description = this.props.displayProfile.description ? this.props.displayProfile.description: "";
        let interests = this.props.displayProfile.tags ? this.props.displayProfile.tags: "";
        let isUser = this.props.displayProfile.isUser === true || this.props.displayProfile.isUser === undefined  ? true : false;
        let picture = this.props.displayProfile.picture != undefined ? this.props.displayProfile.picture : this.props.getUserProfileDefault();


        let userInterests = interests.map((t: { id: { toString: () => void; }; name: any; }) => {
            return {
                value: t.id.toString(),
                label:t.name
            };
        });

        return (
                <Container fluid className="profile-content">
                        <Row>
                            <Col sm={12} className="text-right">
                                { isUser === true ? null :
                                    <FaComment size={'2em'} className="profile-message-me-button" onClick={() => this.setState({ showComposeMessage: true })}/>
                                }
                            </Col>
                        </Row>
                        {/* MAJOR */}
                        <Row className="mb-3">
                            <Row>
                                <Col sm={4}>
                                    <Row className="text-center">
                                        <Col sm={12}><img className="profile-picture-thumbsize" src={picture} alt="user picture"/></Col>
                                        <Col sm={12} className="profile-attribute-display-name">{displayName}</Col>
                                    </Row>
                                </Col>
                                <Col sm={8} className="profile-attribute-header">
                                    <Row>
                                        {/* MAJOR */}
                                        <Col sm={12} className="profile-attribute-header mb-1">major</Col>
                                        <Col sm={12} className="profile-attribute-content">{major}</Col>
                                        {/* COMMUTER */}
                                        <Col sm={12} className="profile-attribute-header mb-1">commuter</Col>
                                        <Col sm={12} className="profile-attribute-content">{commuterStatus}</Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Row>

                        

                        {/* DESCRIPTION */}
                        <Row className="mb-3">
                            <Col sm={12} className="profile-attribute-header">description</Col>
                        </Row>
                        <Row className="mb-3">
                            <Col sm={12} className="profile-attribute-content">{description}</Col>
                        </Row>

                        {/* INTERESTS */}
                        <Row>
                            <Col sm={12} className="profile-attribute-header">interests</Col>
                        </Row>
                        <Row className="mb-3">
                            <Col sm={12}>
                                <Select
                                    options={userInterests}
                                    isDisabled={true}
                                    isMulti={true}
                                    value={userInterests}
                                />
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