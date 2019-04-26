import * as React from "react";
import {Component, ReactNode} from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ReactGrid } from "./ReactGrid";

import "./SearchResults.css";
import { FaUsers } from 'react-icons/fa';

interface Props {
    finalSearchField: string;
}

interface State {
    searchBy: number
    reset: any
}

/**
 * 
 */
export class SearchResults extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            searchBy: 1,
            reset: 0
        }
        this.handleChange = this.handleChange.bind(this);
    }

    private handleChange(radio : React.ChangeEvent<HTMLInputElement>) {
        console.log("Checked:", radio.target.checked)
        if(radio.target.checked == true){
            if(radio.target.id == "1"){
                this.setState({searchBy: 1})
            }
            if(radio.target.id == "2"){
                this.setState({searchBy: 2})
            }
            if(radio.target.id == "3"){
                this.setState({searchBy: 3})
            }
            this.setState({reset: this.state.reset + 1})
        }
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
                <Row className="radiorow">
                    <form className="form-inline">
                        <Col sm={3} md={3}>
                        <label>Search by Users:
                            <input className="form-check-input" id="1" type="radio" name="selected" onChange={this.handleChange} defaultChecked></input>
                        </label>
                        </Col>
                        <Col sm={5} md={5}>
                        <label>Search by Listing:
                            <input className="form-check-input" id="2" type="radio" name="selected" onChange={this.handleChange}></input>
                        </label>
                        </Col>
                        <Col sm={3} md={3}>
                        <label>Search by Event:
                            <input className="form-check-input" id="3" type="radio" name="selected" onChange={this.handleChange}></input>
                        </label>
                        </Col>
                    </form>
                </Row>
                <div key={this.state.reset}>
                    <ReactGrid searchBy={this.state.searchBy} searchField={this.props.finalSearchField}></ReactGrid>
                </div>
            </Container>
        );
    }

}
