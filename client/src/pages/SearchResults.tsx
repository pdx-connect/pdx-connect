import * as React from "react";
import {Component, ReactNode, useState} from "react";
import ReactDataGrid from 'react-data-grid';
import "./SearchResults.css"
import { Container, Row, Col } from "react-bootstrap";
import { Toolbar, Data, Filters } from "react-data-grid-addons";

interface Props {
    finalSearchField: string;
}

interface State {
    rows: [];
}

const selectors = Data.Selectors;

const {
    AutoCompleteFilter,
  } = Filters;

const columns = [
    { key: "displayName", name: "Name", editable: false, filterable: true},
    { key: "major", name: "Major", editable: false, filterable: true},
    { key: "tags", name: "Tags", editable: false, filterable: true, filterRenderer: AutoCompleteFilter}
];


const handleFilterChange = (filter: any) => (filters: any) => {
    const newFilters = { ...filters };
    if (filter.filterTerm) {
        newFilters[filter.column.key] = filter;
    } else {
        delete newFilters[filter.column.key];
    }
    return newFilters;
};

function getValidFilterValues(rows : any, columnId : any) {
    return rows
        .map((r: { [x: string]: any; }) => r[columnId])
        .filter((item: any, i: any, a: { indexOf: (arg0: any) => void; }) => {
            return i === a.indexOf(item);
        });
}

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
            rowsCount={30}
            minHeight={500}
            toolbar={<Toolbar enableFilter={true} />}
            onAddFilter={filter => setFilters(handleFilterChange(filter))}
            onClearFilters={() => setFilters({})}
            getValidFilterValues={columnKey => getValidFilterValues(rows, columnKey)}
        />
    );
}
/**
 * 
 */
export class SearchResults extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {rows: []}
    }

    private readonly enterKeyPressed = (e: any) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            if (this.props.finalSearchField != null) {
                const results = this.getResults(1, this.props.finalSearchField);
            }
        }
    };

    public componentDidMount(){
        document.addEventListener('keydown', this.enterKeyPressed);
        if (this.props.finalSearchField != null) {
            const results = this.getResults(1, this.props.finalSearchField)
        }
    }

    private readonly getResults = async (searchBy: number, displayName: string) => {
        const response: Response = await fetch("/api/search/profile", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                searchBy: searchBy,
                displayName: displayName
            })
        });
        const data = await response.json(); 
        this.setState({rows: data.users})
        return data
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
                <ReactGrid rows={this.state.rows}></ReactGrid>
            </Container>
        );
    }

}