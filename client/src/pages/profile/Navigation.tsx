import * as React from "react";
import {Component, ReactNode} from "react";
import {Row, Nav} from "react-bootstrap";

interface Props {
    updateHistory: (value: string) => void,
}

interface SubState {
}

interface State extends SubState {
}


/**
 * 
 */
export class Navigation extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    public render(): ReactNode {
        
        return (
            <Row>
                <Nav className="flex-column profile-nav">
                    <Nav.Link onClick={() => this.props.updateHistory("/profile/events")}>Events</Nav.Link>
                    <Nav.Link onClick={() => this.props.updateHistory("/profile/listings")}>Listings</Nav.Link>
                    <Nav.Link onClick={() => this.props.updateHistory("/profile/personal")}>Personal</Nav.Link>
                </Nav>
            </Row>
        );
    }

}