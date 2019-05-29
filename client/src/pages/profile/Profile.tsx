import * as React from "react";
import {Component, ReactNode} from "react";
import {RouteComponentProps, Redirect, Route, Switch} from "react-router";
import {Container, Row, Col} from "react-bootstrap";
import {Navigation} from "./Navigation";
import {ProfileContent} from "./ProfileContent";
import {Edit} from "./Edit";
import {Events} from "./Events";
import {Listings} from "./Listings";
import {Settings} from "./Settings";
import {postJSON} from "../../util/json";
import queryString from "query-string";

import "./Profile.css";


interface Props extends RouteComponentProps {
    
}

interface Props {
    updateDisplayName: (s: string) => void;
    updatePortraitURL: () => void;
    getUserProfileDefault: () => string;
    userID?: number;
}

interface State {
    userProfile: UserProfile;
    displayProfile: UserProfile;
}

interface Event {
    deleted: number;
    description: string;
    end: string;
    id: number;
    start: string;
    title: string;
    userID: number;
}

interface Listing {
    anonymous: number;
    deleted: number;
    description: string;
    id: number;
    datePosted: string;
    title: string;
    userID: number;
    tags: Tag[];

}

interface Tag {
    id: number;
    name: string;
}

interface UserEmail {
    activePriority: boolean;
    email: string;
    userID: number;
    verificationCode: string | null;
    verificationTime: string;
}


interface UserProfile {
    commuterStatus: string;
    creationDate: string;
    description: string;
    displayName: string;
    events: Event[];
    isUser: boolean | undefined;
    listings: Listing[];
    major: string;
    picture: string;
    tags: Tag[];
    userID: number | undefined;
    emails: UserEmail[] | null;
    
}

/**
 * 
 */
export class Profile extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            userProfile: {
                commuterStatus: "",
                creationDate: "",
                description: "",
                displayName: "",
                events: [],
                isUser: undefined,
                listings: [],
                major: "",
                picture: "",
                tags: [],
                userID: undefined,
                emails: [],
            },
            displayProfile: {
                commuterStatus: "",
                creationDate: "",
                description: "",
                displayName: "",
                events: [],
                isUser: undefined,
                listings: [],
                major: "",
                picture: "",
                tags: [],
                userID: undefined,
                emails: []
            }
        };
    }

    componentDidMount() {
        const { location, userID } = this.props;

        const values = queryString.parse(location.search);
        const userid = Number(values.userid) ? Number(values.userid) : undefined;

        this.setProfile(userID, userid);
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const { location, userID } = this.props;

        const values = queryString.parse(location.search);
        const userid = Number(values.userid) ? Number(values.userid) : undefined;

        if(Object.keys(this.state.displayProfile).length === 0) {
            this.setProfile(userID, userid);
        } 
    }

    private readonly setProfile = (userID: number|undefined, userid: number|undefined) => {

        if(userid != undefined) {
            this.getProfile(userid).then(data => {
                let displayProfile = data.user[0];
                if(userID != undefined) {

                    displayProfile['isUser'] = false;

                    if(userID === userid) {
                        displayProfile['isUser'] = true;
                    }

                    this.getProfile(userID).then(data => {
                        this.setState({
                            displayProfile: displayProfile,
                            userProfile: data.user[0]
                        });
                    });
                }
            });
        } else {
            if(userID != undefined) {
                this.getProfile(userID).then(data => {
                    let displayProfile = data.user[0];
                    displayProfile['isUser'] = true;
                    this.setState({
                        displayProfile: displayProfile,
                        userProfile: displayProfile
                    });
                });
            }
        }
    }

    private readonly updateUserProfile = () => {
        this.setProfile(this.props.userID, undefined);
    }

    private readonly getProfile = async (userId: number) => {
        const data = await postJSON("/api/user/finduser", {
            userId: userId,
        });

        return data;
    };

    private readonly updateHistory = (v: string) => {
        if(v === "/profile") {
            this.setState({displayProfile: this.state.userProfile});
        }
        
        this.props.history.push(v);
    };



    public render(): ReactNode {

        return (
            <Container fluid className="profile">
            <Row>
                <Col sm={3} className="profile-left-container"><Navigation updateHistory={this.updateHistory}/></Col>
                <Col sm={9} className="profile-right-container">
                    <Switch>
                        <Route
                            exact path="/profile"
                            render={props => <ProfileContent {...props} displayProfile={this.state.displayProfile} getUserProfileDefault={this.props.getUserProfileDefault}/>}
                        />
                        <Route
                            path="/profile/edit"
                            render={props => <Edit {...props} updateDisplayName={this.props.updateDisplayName} userProfile={this.state.userProfile} updateUserProfile={this.updateUserProfile} getUserProfileDefault={this.props.getUserProfileDefault} updatePortraitURL={this.props.updatePortraitURL}/>}
                        />
                        <Route
                            path="/profile/events"
                            render={props => <Events {...props} events={this.state.userProfile.events} />}
                        />
                        <Route
                            path="/profile/listings"
                            render={props => <Listings {...props} listings={this.state.userProfile.listings} updateUserProfile={this.updateUserProfile} displayName={this.state.userProfile.displayName}/>}
                        />
                        <Route
                            path="/profile/settings"
                            render={props => <Settings {...props} />}
                        />

                        <Redirect to="/" />
                    </Switch>
                </Col>
            </Row>
            </Container> 
        );
    }

}