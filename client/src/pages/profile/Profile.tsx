import * as React from "react";
import {Component, ReactNode} from "react";
import {RouteComponentProps, Redirect, Route, Switch} from "react-router";
import {Container, Row, Col} from "react-bootstrap";
import {Navigation} from "./Navigation";
import {ProfileContent} from "./ProfileContent";
import {Edit} from "./Edit";
import {Events} from "./Events";
import {Listings} from "./Listings";
import {postJSON} from "../../util/json";
import queryString from "query-string";

import "./Profile.css";
import { any } from 'prop-types';

interface Props extends RouteComponentProps {
    
}

interface Props {
    updateDisplayName: (s: string) => void;
    updatePortraitURL: () => void;
    getUserProfileDefault: () => string;
    userID?: number;
}

interface State {
    userProfile: DisplayProfile;
    displayProfile: DisplayProfile;
}

interface DisplayProfile {
    [key: string]: any;
}

/**
 * 
 */
export class Profile extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            userProfile: {},
            displayProfile: {}
        };
    }

    componentDidMount() {
        const { location, userID } = this.props;

        const values = queryString.parse(location.search);
        const userid = Number(values.userid) ? Number(values.userid) : undefined;

        this.setProfile(userID, userid);
    }

    componentDidUpdate(prevProps: any, prevState: any) {
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
                        <Route path="/profile/events" component={Events} />
                        <Route path="/profile/listings" component={Listings} />
                        <Redirect to="/" />
                    </Switch>
                </Col>
            </Row>
            </Container> 
        );
    }

}