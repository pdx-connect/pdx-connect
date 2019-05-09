import * as React from "react";
import {Component, ReactNode} from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ReactGrid } from "./ReactGrid";
import "./SearchResults.css";
import { RouteChildrenProps } from 'react-router';

interface Props extends RouteChildrenProps{
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
            <Container fluid className="search-searchResults">
                <Row>
                    <Col sm={10} md={11} className="search-pageTitle"> Search Results </Col>
                </Row>
                <Row className="search-radiorow">
                    <form className="form-inline">
                        <Col sm={4}>
                        <label>Search by Users:
                            <input className="form-check-input" id="1" type="radio" name="selected" onChange={this.handleChange} defaultChecked></input>
                        </label>
                        </Col>
                        <Col sm={4}>
                        <label>Search by Listing:
                            <input className="form-check-input" id="2" type="radio" name="selected" onChange={this.handleChange}></input>
                        </label>
                        </Col>
                        <Col sm={4}>
                        <label>Search by Event:
                            <input className="form-check-input" id="3" type="radio" name="selected" onChange={this.handleChange}></input>
                        </label>
                        </Col>
                    </form>
                </Row>
                <div key={this.state.reset}>
                    <ReactGrid searchBy={this.state.searchBy} searchField={this.props.finalSearchField} history={this.props.history} match={this.props.match} location={this.props.location}></ReactGrid>
                </div>
            </Container>
        );
    }

}
