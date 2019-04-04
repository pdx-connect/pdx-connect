import * as React from "react";
import {Component, ReactNode} from "react";
import { Container, Row, Col, Form, Button, Modal} from "react-bootstrap"
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'

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
            {index: '1', picture: 'Img1', name: 'John Doe', major: 'Computer Science', tags: 'Art boy'},
            {index: '2', picture: 'Img2', name: 'Random Person', major: 'Art', tags: 'Portland'}
        ]
        return (
            <BootstrapTable data={ data } options={ { noDataText: 'There is no search results' }}>
                <TableHeaderColumn dataField='index' isKey>#</TableHeaderColumn>
                <TableHeaderColumn dataField='picture'>Profile Picture</TableHeaderColumn>
                <TableHeaderColumn dataField='name'>Name</TableHeaderColumn>
                <TableHeaderColumn dataField='major'>Major</TableHeaderColumn>
                <TableHeaderColumn dataField='tags'>Tags</TableHeaderColumn>
            </BootstrapTable>
        );
    }

}