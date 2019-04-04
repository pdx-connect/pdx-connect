import * as React from "react";
import {Component, ReactNode} from "react";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'
import "./SearchResults.css"

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
            {index: '1', picture: 'Img1', name: 'John Doe', major: 'Computer Science', tags: 'Art boy, Portland, On-campus'},
            {index: '2', picture: 'Img2', name: 'Random Person', major: 'Art', tags: 'Portland'}
        ]
        return (
            <BootstrapTable data={ data } options={ { noDataText: 'There is no search results' }}>
                <TableHeaderColumn dataField='index' isKey={true} hidden={true} className={'header'}>#</TableHeaderColumn>
                <TableHeaderColumn dataField='picture' className={'header'}>Profile Picture</TableHeaderColumn>
                <TableHeaderColumn dataField='name' className={'header'}>Name</TableHeaderColumn>
                <TableHeaderColumn dataField='major' className={'header'}>Major</TableHeaderColumn>
                <TableHeaderColumn dataField='tags' className={'header'}>Tags</TableHeaderColumn>
            </BootstrapTable>
        );
    }

}