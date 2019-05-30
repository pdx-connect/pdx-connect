import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col} from "react-bootstrap";
import {FaComment} from "react-icons/fa";
import {postJSON} from "../../util/json";
import Select from 'react-select';
import "./Profile.css";

import { RouteChildrenProps } from 'react-router';

interface Props extends RouteChildrenProps{
}

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

    private readonly directMessage = async (userID: number) => {
        let userIDs: number[] = [];
        userIDs.push(userID);

        /*if(userID != undefined) {
            const data = await this.startMessage(userIDs);

            if('conversationID' in data) {
                this.redirectInbox(data.conversation.id);
            } else {
                console.log('error: ', data);
            }
        }*/
        
        // TODO: Remove this when route works
        this.redirectInbox(userID);
     }

    private readonly startMessage = async (userIDs: number[]) => {

        const data = await postJSON("/api/messages/start", {
            userIDs: userIDs
        });

        return data;
    };

    private redirectInbox = async (conversationid: number) => {
        this.props.history.push({
            pathname: '/inbox',
            search: '?conversationid=' + conversationid
        });
    };

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
                        {/* MAJOR */}
                        <Row className="mb-3">
                            <Row>
                                <Col sm={4}>
                                    <Row>
                                        <Col sm={12}><img className="profile-picture-thumbsize" src={picture} alt="user picture"/></Col>
                                            {isUser === true?
                                                null
                                                :
                                                <Col sm={12} className="profile-attribute-message-me text-center">message &nbsp; <FaComment size={'2em'} className="profile-message-me-button" onClick={() => this.directMessage(this.props.displayProfile.userID)} /></Col>
                                            }                          
                                    </Row>
                                </Col>
                                <Col sm={8} className="profile-attribute-header">
                                    <Row>
                                        {/* DISPLAY NAME */}
                                        <Col sm={12} className="profile-attribute-header mb-1">display name</Col>
                                        <Col sm={12} className="profile-attribute-content">{displayName}</Col>
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

                        
                        <Row className="profile-section">
                            <Col sm={12}>
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
                            </Col>
                        </Row>
                </Container>

        );
    }
}