import * as React from "react";
import {Component, ReactNode} from "react";
import { Container, Row, Col, Form, Button, Modal} from "react-bootstrap"
import ReactTable from 'react-table'


interface Props {
    searchField?: string;
}

interface State {
}


/**
 * 
 */
export class SearchResults extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

  
    
    /**
     * @override
     */
    public render(): ReactNode {
        const data = [
            {picture: 'Img1', name: 'John Doe', major: 'Computer Science', tags: 'Art boy'},
            {picture: 'Img2', name: 'Random Person', major: 'Art', tags: 'Portland'}
        ]
        const columns = [{
            Header: 'Profile Picture',
            accessor: 'picture'
        }, {
            Header: 'Name',
            accessor: 'name',
        }, {
            Header: 'Major',
            accessor: 'major'
        }, {
            Header: 'Tags',
            accessor: 'tags'
        }]
        return (
            <Container fluid className="searchResults">
                <Row className="searchTitle">
                    <Col sm={8} md={8} className="Text">Search results for: {this.props.searchField}</Col>
                </Row>
                <ReactTable
                    data={data}
                    columns={columns}
                />
            </Container>
        );
    }

}