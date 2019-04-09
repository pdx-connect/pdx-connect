import * as React from "react";
import {Component, ReactNode, useState} from "react";
import ReactDataGrid from 'react-data-grid';
import "./SearchResults.css"
import { Container, Row, Col } from "react-bootstrap";
import { Toolbar, Data } from "react-data-grid-addons"

interface Props {
    searchField?: string;
}

interface State {
}


const nameFormatter = ({ value } : {value: any}) => {
    return (
        <div>{value.name}</div>
    );
}

const columns = [
    { key: "displayName", name: "Username", editable: false, filterable: true},
    { key: "major", name: "Major", editable: false, formatter: nameFormatter, filterable: true}
];

  const rows = [
    { userID: 1, displayName: "Bradley Odell", major: {id: 4, name: "Computer Science" }},
    { userID: 22, displayName: "Ivan", major: {id: 4, name: "Computer Science"}},
    { userID: 33, displayName: "Brooke", major: {id: 4, name: "Computer Science"}}
];

const selectors = Data.Selectors;

const handleFilterChange = (filter: any) => (filters: any) => {
    const newFilters = { ...filters };
    if (filter.filterTerm) {
        newFilters[filter.column.key] = filter;
    } else {
        delete newFilters[filter.column.key];
    }
    return newFilters;
};

function getRows(rows: any, filters: any) {
    return selectors.getRows({ rows, filters });
}

function ReactGrid({ rows } : { rows : any}) {
    const [filters, setFilters] = useState({});
    const filteredRows = getRows(rows, filters);
    return (
        <ReactDataGrid
            columns={columns}
            rowGetter={i => filteredRows[i]}
            rowsCount={10}
            minHeight={500}
            toolbar={<Toolbar enableFilter={true} />}
            onAddFilter={filter => setFilters(handleFilterChange(filter))}
            onClearFilters={() => setFilters({})}
        />
    );
}
/**
 * 
 */
export class SearchResults extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
    }

    state = { rows };

    /**
     * @override
     */
    public render(): ReactNode {
        return (
            <Container fluid className="searchResults">
                <Row className="toprow">
                    <Col sm={8} md={8} className="resultsFor">Search results for: {this.props.searchField}</Col>
                </Row>
                <ReactGrid rows={rows}></ReactGrid>
            </Container>
        );
    }

}