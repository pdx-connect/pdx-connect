import * as React from "react";
import {Component, ReactNode} from "react";
import {RouteComponentProps, Redirect, Route, Switch} from "react-router";
import {Container, Row, Col} from "react-bootstrap";
import {Navigation} from "./Navigation";
import {ProfileContent} from "./ProfileContent";
import {Personal} from "./Personal";
import {Events} from "./Events";
import {Listings} from "./Listings";

import "./Profile.css";

interface Props extends RouteComponentProps {
    
}

interface Props {
    updateDisplayName: (s: string) => void,
}

interface SubState {
}

interface State extends SubState {
}


/**
 * 
 */
export class Profile extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    private readonly updateHistory = (v: string) => {
        this.props.history.push(v);
    };

    public render(): ReactNode {
        
        return (
            <Container fluid className="profile">
            <Row>
                <Col sm={3} className="profile-left-container"><Navigation updateHistory={this.updateHistory}/></Col>
                <Col sm={9} className="profile-right-container">
                    <Switch>
                    <Route exact path="/profile" component={ProfileContent} />
                        <Route
                            path="/profile/personal"
                            render={props => <Personal {...props} updateDisplayName={this.props.updateDisplayName} />}
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