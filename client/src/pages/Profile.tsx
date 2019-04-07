import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Form} from "react-bootstrap";
import { FaPencilAlt, FaSave, FaUndoAlt } from "react-icons/fa";
import Select from 'react-select';
import "./Profile.css";

interface Disabled {
    displayName: boolean;
    major: boolean;
}

interface Props {
}

interface State {
    displayName: string;
    major: string;
    commuter: string;
    interests: [];
    optInEmail: string;
    picture: string;
    description: string;
    disabled: { [key: string]: boolean };
}




/**
 * 
 */
export class Profile extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            displayName: "",
            major: "",
            commuter: "",
            interests: [],
            optInEmail: "",
            picture: "",
            description: "",
            disabled: {
                'displayName': true,
                'major': true,
                'commuter': true,
                'interests': true,
                'optInEmail': true,
                'picture': true,
                'description': true,
            }
        };
    }

    private readonly enable = (e: any) => {
        let updatedDisabled = this.state.disabled;
        updatedDisabled[e]= !updatedDisabled[e];

        this.setState({
           disabled: updatedDisabled
        });
    };

    private readonly handleChange = (e: any) => {
        this.setState({
            [e.target.id]: e.target.value
        } as any);
    };

    private readonly update = (e: any) => {
        console.log('TODO: user wants to update profile setting: ', e);
    };

    /**
     * @override
     */
    public render(): ReactNode {

        const currentDisplayName = "matilda";
        const currentMajor = "english";

        const commuterOptions = [
            { value: 'on campus', label: 'campus' },
            { value: 'remote', label: 'remote' }
          ]

        const interests = [
            { value: 'on campus', label: 'campus' },
            { value: 'remote', label: 'remote' }
        ]

        
        return (
                <Container fluid className="profile">
                   <Row>
                       <Col sm={4} className="label">display name</Col>

                       <Col sm={4}>
                            <Form.Group className="formBasic">
                                <Form.Control
                                    type="text"
                                    placeholder={currentDisplayName}
                                    onChange={this.handleChange}
                                    id="displayName"
                                    className="generic"
                                    value={this.state.displayName}
                                    disabled={this.state.disabled['displayName']}
                                />
                            </Form.Group>
                       </Col>

                       <Col sm={4} className="edit">
                            {this.state.disabled['displayName']?
                            <div>
                                <FaPencilAlt className="editField" size="2vw" onClick={() => this.enable('displayName')}/>
                            </div>
                                :
                            <div>
                                    <FaSave className="saveChanges" size="2vw" onClick={() => this.update('displayName')}></FaSave>
                                    <FaUndoAlt className="undoEdit" size="2vw" onClick={() => this.enable('displayName')}></FaUndoAlt>
                            </div>
                            }
                       </Col>
                   </Row>

                   <Row>
                       <Col sm={4} className="label">major</Col>

                       <Col sm={4}>
                            <Form.Group className="formBasic">
                                <Form.Control
                                    type="text"
                                    placeholder={currentMajor}
                                    onChange={this.handleChange}
                                    id="major"
                                    className="generic"
                                    value={this.state.major}
                                    disabled={this.state.disabled['major']}
                                />
                            </Form.Group>
                       </Col>
                       
                       <Col sm={4} className="edit">
                            {this.state.disabled['major']?
                            <div>
                                <FaPencilAlt className="editField" size="2vw" onClick={() => this.enable('major')}/>
                            </div>
                                :
                            <div>
                                    <FaSave className="saveChanges" size="2vw" onClick={() => this.update('major')}></FaSave>
                                    <FaUndoAlt className="undoEdit" size="2vw" onClick={() => this.enable('major')}></FaUndoAlt>
                            </div>
                            }
                       </Col>
                   </Row>

                   <Row className="bottomMargin">
                       <Col sm={4} className="label">commuter</Col>

                       <Col sm={4}>
                            <Select options={commuterOptions} />
                       </Col>
                       
                       <Col sm={4} className="edit"></Col>
                   </Row>


                   <Row>
                       <Col sm={4} className="label">interests</Col>
                       <Col sm={4}>
                            <Select
                                options={interests}
                                //value={selectedOptions}
                                //onChange={handleInterestChange}
                                isMulti={true}
                            />
                       </Col>
                       <Col sm={4} className="edit"></Col>
                   </Row>
                </Container>

        );
    }

}