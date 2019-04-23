import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col} from "react-bootstrap";
import {FaArrowAltCircleRight, FaArrowAltCircleLeft} from "react-icons/fa";
import {ActionMeta, ValueType} from "react-select/lib/types";
import {OptionType} from "../../components/types";

import "./Profile.css";

import {Welcome} from './Welcome';
import {Interests} from './Interests';
import {Personalization, Personalizations} from './Personalization';
import {Finalize} from './Finalize';
import {getJSON, postJSON} from "../../util/json";

interface Props {
    onHide: () => void;
}

interface State {
    step: number;
    selectedOptions: OptionType[];
    personalizations: Personalizations;
    tags: {
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
            selectedOptions: [],
            personalizations: {
                profile: true,
                tags: true,
                miscellaneous: true,
                messages: true,
                comments: true
            },
            tags: []
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
        let selectedOptions: OptionType[];
        if (value == null) {
            selectedOptions = [];
        } else if (Array.isArray(value)) {
            selectedOptions = value;
        } else {
            selectedOptions = [value];
        }
        this.setState({selectedOptions});
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

    private readonly setPersonalization = async (profile: boolean, tags: boolean, miscellaneous: boolean, messages: boolean, comments: boolean): Promise<boolean> => {
<<<<<<< HEAD:client/src/pages/profile/Oobe.tsx
        const response: Response = await fetch("/api/user/personalization", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isPublic: profile,
                isTags: tags,
                isMiscellaneous: miscellaneous,
                isDirectMessage: messages,
                isProfileComment: comments
            })
=======
        const data = await postJSON("/api/user/personalization", {
            isPublic: profile,
            isTags: tags,
            isMiscellaneous: miscellaneous,
            isDirectMessage: messages,
            isProfileComment: comments
>>>>>>> persson/messaging-client-and-server:client/src/pages/oobe/Oobe.tsx
        });
        return 'success' in data;
    };

    private readonly finalize = async () => {
        if (await this.createProfile()) {
            const {profile, tags, miscellaneous, messages, comments}= this.state.personalizations;
            if (await this.setPersonalization(profile, tags, miscellaneous, messages, comments)) {
                const selectedOptions = this.state.selectedOptions;
                if (selectedOptions != null) {
                    const selectedInterests: number[] = selectedOptions.map((option: OptionType): number => {
                        const id: number = Number.parseInt(option.value);
                        if (Number.isNaN(id)) {
                            throw new Error("Option value is not a number!");
                        }
                        return id;
                    });
                    if (selectedInterests.length !== 0) {
                        if (await this.setInterests(selectedInterests)) {
                            this.props.onHide();
                        }
                    }
                }
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
    
    /**
     * @override
     */
    public componentDidMount() {
        document.addEventListener('keydown', this.enterKeyPressed);
        this.getTags();
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
            2: Interests,
            3: Personalization,
            4: Finalize
        };

        const CurrentContent = content[this.state.step];
        
        const title: { [key: number]: string } = {
            1: "welcome",
            2: "interests",
            3: "personalization",
            4: "profile complete"
        };

        const options: OptionType[] = this.state.tags.map(t => {
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
                            handlePersonalizationCheck={this.handlePersonalizationCheck}
                            options={options}
                            selectedOptions={this.state.selectedOptions}
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
