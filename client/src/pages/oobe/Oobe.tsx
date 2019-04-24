import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col} from "react-bootstrap";
import {FaArrowAltCircleRight, FaArrowAltCircleLeft} from "react-icons/fa";
import {ActionMeta, ValueType} from "react-select/lib/types";
import {OptionType} from "../../components/types";

import "./oobe.css";

import {Welcome} from './Welcome';
import {About} from './About';
import {Personalization, Personalizations} from './Personalization';
import {Finalize} from './Finalize';
import {getJSON, postJSON} from "../../util/json";

interface Props {
    onHide: () => void;
}

interface State {
    step: number;
    selectedInterests: OptionType[];
    selectedCommuterStatus: OptionType[];
    selectedMajor: OptionType[];
    personalizations: Personalizations;
    tags: {
        id: number;
        name: string;
    }[];
    majors: {
        id: number;
        name: string;
    }[];
}

/**
 * 
 */
export class Oobe extends Component<Props, State> {

    /**
     * Creates the register page.
     */
    constructor(props: Props) {
        super(props);
        this.state = {
            step: 1,
            selectedInterests: [],
            selectedCommuterStatus: [{ value: 'true', label: 'On Campus'}],
            selectedMajor: [],
            personalizations: {
                profile: true,
                tags: true,
                miscellaneous: true,
                messages: true,
                comments: true
            },
            tags: [],
            majors: []
        };
    }

    private readonly next = () => {
        const { step }: any = this.state;
        if(step + 1 === 5) {
            this.setState({
                step: 4
            });
        }
        else {
            this.setState({
                step: step + 1
            });
        }

    };

    private readonly prev = () => {
        const { step }: any = this.state;
        if(step - 1 === 0) {
            this.setState({
                step: 1
            });
        }
        else {
            this.setState({
                step: step - 1
            });
        }
    };

    private readonly enterKeyPressed = (e: any) => {
        if (e.keyCode === 13) {
            console.log('enter pressed');
        }
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
        this.setState({selectedInterests});
    };

    private readonly handleCommuterChange = (value: ValueType<OptionType>, action: ActionMeta) => {
        let selectedCommuterStatus: OptionType[];
        if (value == null) {
            selectedCommuterStatus = [];
        } else if (Array.isArray(value)) {
            selectedCommuterStatus = value;
        } else {
            selectedCommuterStatus = [value];
        }
        this.setState({selectedCommuterStatus});
    };

    private readonly handleMajorChange = (value: ValueType<OptionType>, action: ActionMeta) => {
        let selectedMajor: OptionType[];
        if (value == null) {
            selectedMajor = [];
        } else if (Array.isArray(value)) {
            selectedMajor = value;
        } else {
            selectedMajor = [value];
        }
        this.setState({selectedMajor});
    };
        
    private readonly handlePersonalizationCheck = (checked: boolean,
                                                   event: React.SyntheticEvent<MouseEvent | KeyboardEvent> | MouseEvent,
                                                   id: keyof Personalizations) => {
        let personalizations = this.state.personalizations;
        personalizations[id] = checked;
        this.setState({
            personalizations: personalizations
        });
    };

    private readonly createProfile = async (): Promise<boolean> => {
        const response: Response = await fetch("/api/user/oobe", {
            method: 'POST'
        });
        const data = await response.json();
        return 'success' in data;
    };

    private readonly setInterests = async (selectedTags: number[]) => {
        const data = await postJSON("/api/user/interests", {
            interests: selectedTags
        });
        return 'success' in data;
    };

    private readonly setCommuterStatus = async (selectedStatus: boolean) => {
        const data = await postJSON("/api/user/commuter", {
            commuterStatus: selectedStatus
        });
        return 'success' in data;
    };

    private readonly setMajor = async (selectedMajor: number) => {
        const data = await postJSON("/api/user/major", {
            major: selectedMajor
        });
        return 'success' in data;
    };

    private readonly setPersonalization = async (profile: boolean, tags: boolean, miscellaneous: boolean, messages: boolean, comments: boolean): Promise<boolean> => {
        const data = await postJSON("/api/user/personalization", {
            isPublic: profile,
            isTags: tags,
            isMiscellaneous: miscellaneous,
            isDirectMessage: messages,
            isProfileComment: comments
        });
        return 'success' in data;
    };

    private readonly finalize = async () => {
        if (await this.createProfile()) {
            const {profile, tags, miscellaneous, messages, comments}= this.state.personalizations;
            if (await this.setPersonalization(profile, tags, miscellaneous, messages, comments)) {

                if (this.state.selectedInterests != null) {
                    const selectedInterests: number[] = this.state.selectedInterests.map((option: OptionType): number => {
                        const id: number = Number.parseInt(option.value);
                        if (Number.isNaN(id)) {
                            throw new Error("Option value is not a number!");
                        }
                        return id;
                    });
                    if (selectedInterests.length !== 0) {
                        await this.setInterests(selectedInterests);
                    }
                }

                if(this.state.selectedCommuterStatus[0].value === 'true')
                    await this.setCommuterStatus(true);

                if(this.state.selectedCommuterStatus[0].value === 'false')
                    await this.setCommuterStatus(false);

                if (this.state.selectedMajor.length != 0) {
                    const id: number = Number.parseInt(this.state.selectedMajor[0].value);
                    if (Number.isNaN(id)) {
                        throw new Error("Option value is not a number!");
                    }

                    await this.setMajor(id);
                }

                this.props.onHide();
            }
        }
    };

    private readonly getTags = async () => {
        const data = await getJSON("/api/tags");
        if (!Array.isArray(data)) {
            // Not logged in, throw exception
            throw data;
        }
        this.setState({
            tags: data
        });
    };

    private readonly getMajors = async () => {
        const data = await getJSON("/api/tags/majors");
        if (!Array.isArray(data)) {
            // Not logged in, throw exception
            throw data;
        }
        this.setState({
            majors: data
        });
    };

    
    /**
     * @override
     */
    public componentDidMount() {
        document.addEventListener('keydown', this.enterKeyPressed);
        this.getTags();
        this.getMajors();
    }
    
    /**
     * @override
     */
    public componentWillUnmount() {
        document.removeEventListener('keydown', this.enterKeyPressed);
    }

    /**
     * @override
     */
    public render(): ReactNode {

        const content: { [key: number]: any } = {
            1: Welcome,
            2: About,
            3: Personalization,
            4: Finalize
        };

        const CurrentContent = content[this.state.step];
        
        const title: { [key: number]: string } = {
            1: "welcome",
            2: "about you",
            3: "personalization",
            4: "profile complete"
        };

        const tags: OptionType[] = this.state.tags.map(t => {
            return {
                value: t.id.toString(),
                label: t.name
            };
        });

        const commuterStatus: OptionType[] = [
            { value: 'true', label: 'On Campus'},
            { value: 'false', label: 'Off Campus'}
        ];

        const majors: OptionType[] = this.state.majors.map(t => {
            return {
                value: t.id.toString(),
                label: t.name
            };
        });


        return (
            <Container fluid className="oobe">
                <Row className="title alignCenter">
                    <Col sm={12}><h1>pdx connect</h1></Col>
                </Row>

                <Row className="subTitle">
                    <Col sm={12} className="alignCenter"><h3>{title[this.state.step]}</h3></Col>
                </Row>
                <Row>
                    <Col sm={3} className="directionalButtons">
                    {this.state.step != 1?
                            <FaArrowAltCircleLeft className="leftButton" size="4vw" onClick={this.prev}/>: null}
                    </Col>
                    <Col sm={6}>
                        <CurrentContent
                            handleInterestChange={this.handleInterestChange}
                            handleCommuterChange={this.handleCommuterChange}
                            handleMajorChange={this.handleMajorChange}
                            handlePersonalizationCheck={this.handlePersonalizationCheck}
                            tags={tags}
                            majors={majors}
                            commuterStatus={commuterStatus}
                            selectedInterests={this.state.selectedInterests}
                            selectedCommuterStatus={this.state.selectedCommuterStatus}
                            selectedMajors={this.state.selectedMajor}
                            personalizations={this.state.personalizations}
                            finalize={this.finalize}
                        />
                    </Col>
                    <Col sm={3} className="directionalButtons">
                        {this.state.step != 4? <FaArrowAltCircleRight className="rightButton" size="4vw" onClick={this.next}/>: null} 
                    </Col>
                </Row>
            </Container>
        );
    }

}
