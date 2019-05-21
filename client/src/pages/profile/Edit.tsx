import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Form} from "react-bootstrap";
import {FaPencilAlt, FaSave, FaUndoAlt} from "react-icons/fa";
import Select from 'react-select';
import {ActionMeta, ValueType} from "react-select/lib/types";
import {OptionType} from "../../components/types";
import {getJSON, postJSON} from "../../util/json";

import "./Profile.css";

interface State {
    major: string;
    optInEmail: string;
    picture: string;
    picture64: string;
    description: string;
    commuterStatus: boolean;
    majors: {
        value: string;
        label: string;
    }[],
    commuterOptions: {
        value: string;
        label: string;
    }[],
    interests: {
        value: string;
        label: string;
    }[],
    error: { [key: string]: boolean },
    disabled: { [key: string]: boolean },
    displayName: string,
    selectedMajors: OptionType[],
    selectedCommuterOptions: OptionType[],
    selectedInterests: OptionType[];
}

interface Props {
    updateDisplayName: (s: string) => void,
    updateUserProfile: () => void,
    userProfile: { [key: string]: any}
}


/**
 * 
 */
export class Edit extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            major: "",
            optInEmail: "",
            picture: "",
            picture64: "",
            description: "",
            commuterStatus: false,
            majors: [],
            commuterOptions: [],
            interests: [],
            error: {
                'displayName': false,
                'major': false,
                'majors': false,
                'commuterStatus': false,
                'comm_status': false,
                'interests': false,
                'optInEmail': false,
                'picture': false,
                'description': false
            },
            disabled: {
                'displayName': true,
                'major': true,
                'majors': true,
                'commuterStatus': true,
                'comm_status': true,
                'interests': true,
                'optInEmail': true,
                'picture': true,
                'description': true
            },
            displayName: "",
            selectedMajors: [],
            selectedCommuterOptions: [],
            selectedInterests: []
        }
    }

    /**
     * @override
    */
    public componentDidMount() {
        const commuterOptions = [
            { value: 'true', label: 'campus' },
            { value: 'false', label: 'remote' }
        ]

        const interests = [
            { value: 'free food', label: 'free food' },
            { value: 'biking', label: 'biking' },
            { value: 'art', label: 'art'},
            { value: 'computer science', label: 'computer science'}
        ]

        this.getMajors().then(data => {
            
            const majors = data.map((t: { id: { toString: () => void; }; name: any; }) => {
                return {
                    value: t.id.toString(),
                    label:t.name
                };
            });

            this.setState({
                majors: majors,
                commuterOptions: commuterOptions,
                interests: interests
            });
        });
    }

    private readonly getMajors = async () => {
        const data = await getJSON("/api/tags/majors");
        return data;
    };

    private readonly handleChange = (e: any) => {
        this.setState({
            [e.target.id]: e.target.value
        } as any);
    };

    private readonly toggle = (e: string, state?: boolean) => {
        let updatedDisabled = this.state.disabled;
        updatedDisabled[e] = state != null ? state : !updatedDisabled[e];

        this.setState({
           disabled: updatedDisabled
        });
    };

    private readonly error = (e: string, state?: boolean) => {
        let updatedError = this.state.error;
        updatedError[e] = state != null ? state : !updatedError[e];

        this.setState({
           error: updatedError
        });
    };

    private readonly handleMajorChange = (value: ValueType<OptionType>, action: ActionMeta) => {
        let selectedMajors: OptionType[];
        
        if (value == null) {
            selectedMajors = [];
        } else if (Array.isArray(value)) {
            selectedMajors = value;
        } else {
            selectedMajors = [value];
        }

        this.setState({
            selectedMajors: selectedMajors,
            major: selectedMajors[0].label
        });

        this.update('major', selectedMajors[0].value);
    };

    private readonly handleCommuterChange = (value: ValueType<OptionType>, action: ActionMeta) => {
        let selectedCommuterOptions: OptionType[];
        
        if (value == null) {
            selectedCommuterOptions = [];
        } else if (Array.isArray(value)) {
            selectedCommuterOptions = value;
        } else {
            selectedCommuterOptions = [value];
        }

        this.setState({
            selectedCommuterOptions: selectedCommuterOptions,
            commuterStatus: selectedCommuterOptions[0].value === "true" ? true : false
        });

        this.update('commuterStatus', selectedCommuterOptions[0].value);
    };

    private readonly handleInterestChange = (value: ValueType<OptionType>, action: ActionMeta) => {
        let selectedInterests: OptionType[];

        if (value == null) {
            selectedInterests = [];
        } else if (Array.isArray(value)) {
            selectedInterests = value;
        } else {
            selectedInterests = [value];
        }

        this.setState({selectedInterests: selectedInterests});
        this.update('selectedInterests', selectedInterests[0].value);
    };

    private readonly handlePictureChange = (e: any) => {
        let files = e.target.files;
        
        const fileReader: FileReader = new FileReader();
        fileReader.readAsDataURL(files[0]);
        
        fileReader.onload = (e: Event) => {
            if(typeof (fileReader.result) === "string") {
                this.setState({
                    picture: URL.createObjectURL(files[0]),
                    picture64: fileReader.result
                });
                this.update('picture', fileReader.result);
            }            
        }        
    };

    private readonly update = async (e: string, v: string | null) => {
        
        switch (e) {
            case "displayName": {
                const data = await postJSON("/api/user/name", this.state.displayName);
                if (!('success' in data)) {
                    this.error(e, true);
                    return;
                } else {
                    this.props.updateDisplayName(this.state.displayName);
                }
                break;
            }
            case "major": {              
                const data = await postJSON("/api/user/major", {
                    major: Number(v)
                });

                if (!('success' in data)) {
                    this.error(e, true);
                    return;
                } else {
                    this.props.updateUserProfile();
                }
                break;
            }
            case "commuterStatus": {
                console.log('commuter status: ', v);
                const data = await postJSON("/api/user/on_campus", {
                    commuterStatus: v === "true" ? true : false
                });
                if (!('success' in data)) {
                    this.error(e, true);
                    return;
                } else {
                    this.props.updateUserProfile();
                }
                break;
            }
            case "selectedInterests": {
                console.log('selectedIntrests: ', v);
                break;
            }
            case "optInEmail": {
                console.log('optInEmail: ', v);
                break;
            }
            case "picture": {
                const data = await postJSON("/api/user-profile/picture", {
                    picture: v
                });

                /*if (!('success' in data)) {
                    this.error(e, true);
                    return;
                } else {
                    this.props.updateUserProfile();
                }*/
                console.log('data in edit: ', data);
                break;
            }
            case "description": {
                const data = await postJSON("/api/user/description", this.state.description);
                if (!('success' in data)) {
                    this.error(e, true);
                    return;
                } else {
                    this.props.updateUserProfile();
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

        let displayName = this.props.userProfile.displayName ? this.props.userProfile.displayName : "";
        let major = this.props.userProfile.major ? this.props.userProfile.major : "";
        let commuterStatus = this.props.userProfile.commuterStatus ? this.props.userProfile.commuterStatus : "";
        let currentOptIn = this.props.userProfile.currentOptIn ? this.props.userProfile.currentOptIn : "";
        let description = this.props.userProfile.description ? this.props.userProfile.description : "";

        console.log('user profile: ', this.props.userProfile);
        
        return (
                <Container fluid className="profile">
                    
                    {/* DISPLAY NAME */}
                    <Row>
                       <Col sm={4} className="label">display name</Col>
                        <Col sm={4}>
                            <Form.Group className="formBasic">
                                <Form.Control
                                    type="text"
                                    placeholder={displayName}
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
                                    <FaSave className="saveChanges" size="2vw" onClick={() => this.update('displayName', null)}></FaSave>
                                    <FaUndoAlt className="undoEdit" size="2vw" onClick={() => this.toggle('displayName')}></FaUndoAlt>
                                </div>
                            }
                        </Col>
                   </Row>

                    {/* MAJOR */}
                   <Row className="bottomMargin">
                       <Col sm={4} className="label">major</Col>
                       <Col sm={4}>
                            <Select
                                options={this.state.majors}
                                value={this.state.selectedMajors}
                                onChange={this.handleMajorChange}
                                isMulti={false}
                                placeholder={major}
                            />
                       </Col>
                   </Row>


                    {/* COMMUTER */}
                   <Row className="bottomMargin">
                       <Col sm={4} className="label">commuter</Col>

                       <Col sm={4}>
                            <Select 
                                options={this.state.commuterOptions} 
                                onChange={this.handleCommuterChange}
                                placeholder={commuterStatus}
                            />
                       </Col>
                   </Row>


                    {/* INTERESTS */}
                   <Row className="bottomMargin">
                       <Col sm={4} className="label">interests</Col>
                       <Col sm={4}>
                            <Select
                                options={this.state.interests}
                                value={this.state.selectedInterests}
                                onChange={this.handleInterestChange}
                                isMulti={true}
                            />
                       </Col>
                       <Col sm={4} className="edit"></Col>
                   </Row>

                    
                    {/* OPT IN EMAIL */}
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
                                    <FaSave className="saveChanges" size="2vw" onClick={() => this.update('optInEmail', null)}></FaSave>
                                    <FaUndoAlt className="undoEdit" size="2vw" onClick={() => this.toggle('optInEmail')}></FaUndoAlt>
                                </div>
                            }
                       </Col>
                   </Row>


                    {/* PICTURE */}
                   <Row>
                       <Col sm={4} className="label">picture</Col>

                       <Col sm={8}>
                            <Form.Group className="formBasic">
                                <Form.Control
                                        type="file"
                                        onChange={(e: any) => this.handlePictureChange(e)}
                                        id="picture"
                                        className="generic"
                                />
                            </Form.Group>
                       </Col>
                   </Row>
                   <Row>
                        <Col sm={1} className="label"></Col>
                        <Col sm={11} className="edit"> {this.state.picture != "" ? <img src={this.state.picture} className="profile-picture-halfsize"/> : null} </Col>
                    </Row>



                   {/* DESCRIPTION */}
                   <Row>
                       <Col sm={4} className="label">description</Col>

                       <Col sm={4}>
                            <Form.Group className="formBasic">
                                <Form.Control
                                    as="textarea"
                                    placeholder={description}
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
                                        <FaSave className="saveChanges" size="2vw" onClick={() => this.update('description', null)}></FaSave>
                                        <FaUndoAlt className="undoEdit" size="2vw" onClick={() => this.toggle('description')}></FaUndoAlt>
                                </div>
                            }
                       </Col>
                   </Row>

                </Container>

        );
    }

}