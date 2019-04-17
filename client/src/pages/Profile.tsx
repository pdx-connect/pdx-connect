import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Form} from "react-bootstrap";
import { FaPencilAlt, FaSave, FaUndoAlt } from "react-icons/fa";
import Select from 'react-select';
import {ActionMeta, ValueType} from "react-select/lib/types";
import {OptionType} from "../components/types";
import "./Profile.css";

interface Disabled {
    displayName: boolean;
    major: boolean;
}

interface Props {
    selectedOptions: ValueType<OptionType>;
    handleInterestChange: (value: ValueType<OptionType>, action: ActionMeta) => void;
}

interface SubState {
    displayName: string;
    major: string;
    majors: {
        value: string;
        label: string;
    }[];
    commuter: string;
    interests: [];
    optInEmail: string;
    picture: string;
    description: string;
}

interface State extends SubState {
    error: { [key in keyof SubState]: boolean };
    disabled: { [key in keyof SubState]: boolean };
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
            majors: [],
            commuter: "",
            interests: [],
            optInEmail: "",
            picture: "",
            description: "",
            error: {
                'displayName': false,
                'major': false,
                'majors': false,
                'commuter': false,
                'interests': false,
                'optInEmail': false,
                'picture': false,
                'description': false
            },
            disabled: {
                'displayName': true,
                'major': true,
                'majors': true,
                'commuter': true,
                'interests': true,
                'optInEmail': true,
                'picture': true,
                'description': true
            }
        };
    }

    // Obtains the majors list from the DB
    private readonly getmajors = async () => {
        const response: Response = await fetch("/api/tags/majors", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const majors: {
            id: number;
            name: string;
        }[] = await response.json();

        const all_majors = majors.map(t => {
            return {
                value: t.id.toString(),
                label: t.name
            };
        });
        
        this.setState({
            majors: all_majors
        });
    }

    /**
     * @override
     */
    public componentDidMount() {
        // TODO: Call database and get an array of majors.
        // 

        // A temporary list of majors. A user can only select one major at a time.
        // Will be replaced by the database's list of major tags.
        const listmajors = [
            { value: 'food', label: 'food' },
            { value: 'english', label: 'english'},
            { value: 'art', label: 'art' }
        ];


        this.getmajors();
    }

    private readonly toggle = (e: keyof SubState, state?: boolean) => {
        let updatedDisabled = this.state.disabled;
        updatedDisabled[e] = state != null ? state : !updatedDisabled[e];

        this.setState({
           disabled: updatedDisabled
        });
    };

    private readonly error = (e: keyof SubState, state?: boolean) => {
        let updatedError = this.state.error;
        updatedError[e] = state != null ? state : !updatedError[e];

        this.setState({
           error: updatedError
        });
    };

    private readonly handleChange = (e: any) => {
        this.setState({
            [e.target.id]: e.target.value
        } as any);
    };

    // Update profile data from the database.
    private readonly update = async (e: keyof SubState) => {
        console.log('TODO: user wants to update profile setting: ', e);
        // Update specific profile information and send changes to the
        // DB
        switch (e) {
            case "displayName": {
                const response: Response = await fetch("/api/user/name", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.state.displayName)
                });
                const data = await response.json();
                if (!('success' in data)) {
                    this.error(e, true);
                    return;
                }
                break;
            }
            case "major": {
                const response: Response = await fetch("/api/user/major", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.state.major)
                });
                const data = await response.json();
                if (!('success' in data)) {
                    this.error(e, true);
                    return;
                }
                break;
            }
            case "description": {
                const response: Response = await fetch("/api/user/description", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.state.description)
                });
                const data = await response.json();
                if (!('success' in data)) {
                    this.error(e, true);
                    return;
                }
                break;
            }
            default:
                console.error("Unsupported update field");
                break;
        }
        this.toggle(e, true);
    };

    /**
     * @override
     */
    public render(): ReactNode {

        // Placeholder variables for the profile fields
        const currentDisplayName = "matilda";
        const currentMajor = "english";
        const currentBio = "New to Oregon and PSU. Looking to connect with foodies, art lovers, and other anthro majors.";
        const currentOptIn = "mat@gmail.com";
        const currentPicture = "matilda.png";

        const {selectedOptions, handleInterestChange} = this.props;

        // Commuter options (one or the other)
        const commuterOptions = [
            { value: 'on campus', label: 'campus' },
            { value: 'remote', label: 'remote' }
          ]

        // User's interests. A user can select multiple interests.
        const interests = [
            { value: 'free food', label: 'free food' },
            { value: 'biking', label: 'biking' },
            { value: 'art', label: 'art'},
            { value: 'computer science', label: 'computer science'}
        ]
        
        return (
                <Container fluid className="profile">
                   <Row> {/* Display name */}
                       <Col sm={4} className="label">display name</Col>

                       <Col sm={4}>
                            <Form.Group className="formBasic">
                                <Form.Control
                                    type="text"
                                    placeholder={currentDisplayName}
                                    onChange={this.handleChange}
                                    id="displayName"
                                    className={this.state.error.displayName ? "error" : "generic"}
                                    value={this.state.displayName}
                                    disabled={this.state.disabled.displayName}
                                />
                            </Form.Group>
                       </Col>

                       <Col sm={4} className="edit">
                            {this.state.disabled['displayName']?
                            <div>
                                <FaPencilAlt className="editField" size="2vw" onClick={() => this.toggle('displayName')}/>
                            </div>
                                :
                            <div>
                                    <FaSave className="saveChanges" size="2vw" onClick={() => this.update('displayName')}></FaSave>
                                    <FaUndoAlt className="undoEdit" size="2vw" onClick={() => this.toggle('displayName')}></FaUndoAlt>
                            </div>
                            }
                       </Col>
                   </Row>

                    {/* Major */}
                   <Row className="bottomMargin">
                       <Col sm={4} className="label">major</Col>
                       <Col sm={4}>
                            <Select
                                options={this.state.majors}
                                value={selectedOptions}
                                onChange={handleInterestChange}
                            />
                       </Col>

                       <Col sm={4} className="edit"></Col>

                   </Row>

                   {/* Commuter status */}
                   <Row className="bottomMargin">
                       <Col sm={4} className="label">commuter</Col>

                       <Col sm={4}>
                            <Select options={commuterOptions} />
                       </Col>
                       
                       <Col sm={4} className="edit"></Col>
                   </Row>

                   {/* Interests */}
                   <Row className="bottomMargin">
                       <Col sm={4} className="label">interests</Col>
                       <Col sm={4}>
                            <Select
                                options={interests}
                                value={selectedOptions}
                                onChange={handleInterestChange}
                                isMulti={true}
                            />
                       </Col>
                       <Col sm={4} className="edit"></Col>
                   </Row>

                    {/* Opt-in email */}
                   <Row >
                       <Col sm={4} className="label">opt-in email</Col>

                       <Col sm={4}>
                            <Form.Group className="formBasic">
                                <Form.Control
                                    type="text"
                                    placeholder={currentOptIn}
                                    onChange={this.handleChange}
                                    id="optInEmail"
                                    className="generic"
                                    value={this.state.optInEmail}
                                    disabled={this.state.disabled['optInEmail']}
                                />
                            </Form.Group>
                       </Col>
                       
                       <Col sm={4} className="edit">
                            {this.state.disabled['optInEmail']?
                            <div>
                                <FaPencilAlt className="editField" size="2vw" onClick={() => this.toggle('optInEmail')}/>
                            </div>
                                :
                            <div>
                                    <FaSave className="saveChanges" size="2vw" onClick={() => this.update('optInEmail')}></FaSave>
                                    <FaUndoAlt className="undoEdit" size="2vw" onClick={() => this.toggle('optInEmail')}></FaUndoAlt>
                            </div>
                            }
                       </Col>
                   </Row>

                {/* Picture */}
                   <Row>
                       <Col sm={4} className="label">picture</Col>

                       <Col sm={4}>
                            <Form.Group className="formBasic">
                                <Form.Control
                                    type="text"
                                    placeholder={currentPicture}
                                    onChange={this.handleChange}
                                    id="picture"
                                    className="generic"
                                    value={this.state.picture}
                                    disabled={this.state.disabled['picture']}
                                />
                            </Form.Group>
                       </Col>
                       
                       <Col sm={4} className="edit">
                            {this.state.disabled['picture']?
                            <div>
                                <FaPencilAlt className="editField" size="2vw" onClick={() => this.toggle('picture')}/>
                            </div>
                                :
                            <div>
                                    <FaSave className="saveChanges" size="2vw" onClick={() => this.update('picture')}></FaSave>
                                    <FaUndoAlt className="undoEdit" size="2vw" onClick={() => this.toggle('picture')}></FaUndoAlt>
                            </div>
                            }
                       </Col>
                   </Row>

                    {/* Biography */}
                   <Row>
                       <Col sm={4} className="label">description</Col>

                       <Col sm={4}>
                            <Form.Group className="formBasic">
                                <Form.Control
                                    as="textarea"
                                    placeholder={currentBio}
                                    onChange={this.handleChange}
                                    id="description"
                                    className="generic"
                                    value={this.state.description}
                                    disabled={this.state.disabled['description']}
                                />
                            </Form.Group>
                       </Col>
                       
                       <Col sm={4} className="edit">
                            {this.state.disabled['description']?
                            <div>
                                <FaPencilAlt className="editField" size="2vw" onClick={() => this.toggle('description')}/>
                            </div>
                                :
                            <div>
                                    <FaSave className="saveChanges" size="2vw" onClick={() => this.update('description')}></FaSave>
                                    <FaUndoAlt className="undoEdit" size="2vw" onClick={() => this.toggle('description')}></FaUndoAlt>
                            </div>
                            }
                       </Col>
                   </Row>


                </Container>

        );
    }

}