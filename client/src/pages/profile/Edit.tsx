import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Form, Button} from "react-bootstrap";
import {FaPencilAlt, FaSave, FaUndoAlt} from "react-icons/fa";
import Select from 'react-select';
import {ActionMeta, ValueType} from "react-select/lib/types";
import {OptionType} from "../../components/types";
import {getJSON, postJSON} from "../../util/json";

import "./Profile.css";
import { Tags } from '../oobe/preferences/Tags';

interface State {
    major: string;
    optInEmail: string;
    picture: string;
    picture64: string;
    pictureCommit: boolean;
    pictureError: boolean;
    pictureErrorMsg: string;
    description: string;
    commuterStatus: boolean;
    majors: {
        value: string;
        label: string;
    }[],
    tags: {
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
    updateDisplayName: (s: string) => void;
    updateUserProfile: () => void;
    getUserProfileDefault: () => string;
    updatePortraitURL: () => void;
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
            pictureCommit: false,
            pictureError: false,
            pictureErrorMsg: "",
            description: "",
            commuterStatus: false,
            majors: [],
            tags: [],
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
            selectedInterests: [],
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

        this.getMajors().then(majors => {
            this.getTags().then(tags => {

                const interests = tags.map((t: { id: { toString: () => void; }; name: any; }) => {
                    return {
                        value: t.id.toString(),
                        label:t.name
                    };
                });

                const majorOptions = majors.map((t: { id: { toString: () => void; }; name: any; }) => {
                    return {
                        value: t.id.toString(),
                        label:t.name
                    };
                });

                let userInterests = this.props.userProfile.tags ? this.props.userProfile.tags: [];
                let selectedInterests: OptionType[] = [];
                let filteredInterests: OptionType[] = interests;

                if(userInterests.length != 0) {

                    selectedInterests = userInterests.map((t: { id: { toString: () => void; }; name: any; }) => {
                        return {
                            value: t.id.toString(),
                            label:t.name
                        };
                    });

                    
                    for(const selected of selectedInterests)
                    {
                        filteredInterests = filteredInterests.filter(x => { return x.label != selected.label; })
                    }


                }
    
                this.setState({
                    interests: filteredInterests,
                    majors: majorOptions,
                    commuterOptions: commuterOptions,
                    selectedInterests: selectedInterests
                });

            });
        });
    }

    private readonly getTags = async () => {
        const data = await getJSON("/api/tags");
        return data;

    };

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
        let selectedMajors = OptionType.resolve(value);
        
        this.setState({
            selectedMajors: selectedMajors,
            major: selectedMajors[0].label
        });

        this.update('major', selectedMajors[0].value);
    };

    private readonly handleCommuterChange = (value: ValueType<OptionType>, action: ActionMeta) => {
        let selectedCommuterOptions = OptionType.resolve(value);

        this.setState({
            selectedCommuterOptions: selectedCommuterOptions,
            commuterStatus: selectedCommuterOptions[0].value === "true" ? true : false
        });

        this.update('commuterStatus', selectedCommuterOptions[0].value);
    };

    private readonly handleInterestChange = (value: ValueType<OptionType>, action: ActionMeta) => {
        let selectedInterests = OptionType.resolve(value);

        this.setState({selectedInterests: selectedInterests});
        this.update('selectedInterests', JSON.stringify(selectedInterests));
    };

    private readonly handlePictureChange = (e: any) => {
        let files = e.target.files;
        
        const fileReader: FileReader = new FileReader();
        fileReader.readAsDataURL(files[0]);

        // size is in bytes
        const fileSize = files[0].size;
        
        // medium blob = 16777215 bytes
        const mediumBlob = 16777215;
        const fileSize64 = Math.ceil(fileSize / 3) * 4;

        if(fileSize64 < mediumBlob) {
            fileReader.onload = (e: Event) => {
            
                if(typeof (fileReader.result) === "string") {
                    
                    this.setState({
                        picture: URL.createObjectURL(files[0]),
                        picture64: fileReader.result,
                        pictureCommit: true,
                        pictureError: false,
                        pictureErrorMsg: ""
                    });
                }            
            }     
        } else {
            this.setState({
                pictureError: true,
                pictureErrorMsg: "File is too big",
                pictureCommit: false,
            });
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
                    this.props.updateUserProfile();
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
                if(v != null) {
                    let selectedTags = JSON.parse(v);

                    const selectedInterests: number[] = selectedTags.map((option: OptionType): number => {
                        const id: number = Number.parseInt(option.value);
                        if (Number.isNaN(id)) {
                            throw new Error("Option value is not a number!");
                        }
                        return id;
                    });
                        
                    const data = await postJSON("/api/user/interests", {
                        interests: selectedInterests
                    });

                    if (!('success' in data)) {
                        this.error(e, true);
                        return;
                    } else {
                        this.props.updateUserProfile();
                    }
                }
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

                if (!('success' in data)) {
                    this.error(e, true);
                    return;
                } else {
                    this.setState({
                        picture: "",
                        picture64: "",
                        pictureCommit: false,
                        pictureError: false,
                        pictureErrorMsg: "",
                    });
                    this.props.updatePortraitURL();
                    this.props.updateUserProfile();
                }
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
        let interests = this.props.userProfile.tags ? this.props.userProfile.tags: [];
        let picture = this.props.userProfile.picture != undefined ? this.props.userProfile.picture : this.props.getUserProfileDefault();
        
        return (
                <Container fluid className="profile">
                    
                    {/* DISPLAY NAME */}
                    <Row className="pt-3">
                        <Col sm={4} className="profile-label">display name</Col>
                        <Col sm={8}>
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
                    </Row>
                    <Row className="pb-3">
                        <Col sm={4} className="profile-label"></Col>
                        <Col sm={8} className="edit profile-move-edit-icon-up">
                            {this.state.disabled['displayName']?
                                <div className="text-right">
                                    <FaPencilAlt className="editField" size="2vw" onClick={() => this.toggle('displayName')}/>
                                </div>
                                    :
                                <div className="text-right">
                                    <FaSave className="saveChanges" size="2vw" onClick={() => this.update('displayName', null)}></FaSave>
                                    <FaUndoAlt className="undoEdit" size="2vw" onClick={() => this.toggle('displayName')}></FaUndoAlt>
                                </div>
                            }
                        </Col>
                   </Row>

                    {/* MAJOR */}
                   <Row className="pb-3">
                       <Col sm={4} className="profile-label">major</Col>
                       <Col sm={8}>
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
                   <Row className="pb-3">
                       <Col sm={4} className="profile-label">commuter</Col>

                       <Col sm={8}>
                            <Select 
                                options={this.state.commuterOptions} 
                                onChange={this.handleCommuterChange}
                                placeholder={commuterStatus}
                            />
                       </Col>
                   </Row>


                    {/* INTERESTS */}
                   <Row className="pb-3">
                       <Col sm={4} className="profile-label">interests</Col>
                       <Col sm={8}>
                            <Select
                                options={this.state.interests}
                                value={this.state.selectedInterests}
                                onChange={this.handleInterestChange}
                                isMulti={true}
                            />
                       </Col>
                   </Row>

                    
                    {/* OPT IN EMAIL */}
                   <Row>
                       <Col sm={4} className="profile-label">opt-in email</Col>

                       <Col sm={8}>
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
                    </Row>
                    <Row className="pb-3">
                        <Col sm={4} className="profile-label"></Col>
                        <Col sm={8} className="edit profile-move-edit-icon-up">
                            {this.state.disabled['optInEmail']?
                                <div className="text-right">
                                    <FaPencilAlt className="editField" size="2vw" onClick={() => this.toggle('optInEmail')}/>
                                </div>
                                    :
                                <div className="text-right">
                                    <FaSave className="saveChanges" size="2vw" onClick={() => this.update('optInEmail', null)}></FaSave>
                                    <FaUndoAlt className="undoEdit" size="2vw" onClick={() => this.toggle('optInEmail')}></FaUndoAlt>
                                </div>
                            }
                       </Col>
                   </Row>


                    {/* PICTURE */}
                   <Row className="pb-3">
                       <Col sm={4} className="profile-label">picture</Col>

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
                   <Row className="pb-3">
                       <Col sm={4} className="profile-label">current picture</Col>

                       <Col sm={8}>
                            <img src={picture} className="profile-picture-thumbsize"/>
                       </Col>
                   </Row>
                   <Row className="pb-3">
                       <Col sm={4} className="profile-label">{this.state.pictureCommit === true ? <Button className="profile-upload" onClick={() => this.update('picture', this.state.picture64)}>upload</Button> : null}</Col>

                       <Col sm={8}>
                            {this.state.picture64 != "" ? <img src={this.state.picture64} className="profile-picture-thumbsize"/> : null}
                       </Col>
                   </Row>
                   <Row className="pb-3">
                       <Col sm={4} className="profile-label">{this.state.pictureError === true ? "Upload Error" : null}</Col>

                       <Col sm={8}>
                            {this.state.pictureError === true ? this.state.pictureErrorMsg : null}
                       </Col>
                   </Row>


                   {/* DESCRIPTION */}
                   <Row>
                       <Col sm={4} className="profile-label">description</Col>

                       <Col sm={8}>
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
                   </Row>
                   <Row className="pb-3">
                        <Col sm={4} className="profile-label"></Col>
                        <Col sm={8} className="edit profile-move-edit-icon-up">
                            {this.state.disabled['description']?
                                <div className="text-right">
                                    <FaPencilAlt className="editField" size="2vw" onClick={() => this.toggle('description')}/>
                                </div>
                                    :
                                <div className="text-right">
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