import * as React from "react";
import {Component, ReactNode} from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ReactGrid } from "./ReactGrid";

import "./SearchResults.css";

interface Props {
    finalSearchField: string;
}

interface State {
   
}

/**
 * 
 */
export class SearchResults extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
    }
    
    /**
     * @override
     */
    public render(): ReactNode {
        return (
            <Container fluid className="searchResults">
                <Row className="toprow">
                    <Col sm={8} md={8} className="resultsFor">Search results by username for: {this.props.finalSearchField}</Col>
                </Row>
                <ReactGrid searchBy={1} searchField={this.props.finalSearchField}></ReactGrid>
            </Container>
        );
    }

}
