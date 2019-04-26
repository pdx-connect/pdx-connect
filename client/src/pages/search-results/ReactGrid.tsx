import * as React from "react";
import {Component, ReactNode} from "react";
import ReactDataGrid from 'react-data-grid';
import { Toolbar, Data, Filters } from "react-data-grid-addons";
import {getJSON, postJSON} from "../../util/json";

import "./SearchResults.css";

interface Props {
    //1 is user, 2 for events, 3 for calendar
    searchBy: number;
    searchField: string;
}

interface State {
    rows: [];
    tags: {
        id: number;
        name: string;
    }[];
    filters: any;
}

const {
    MultiSelectFilter,
    AutoCompleteFilter,
} = Filters;

export class ReactGrid extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            rows: [],
            tags: [{id: 1, name: ""}],
            filters: {}
        };
    }
    
    private readonly enterKeyPressed = (e: any) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            if (this.props.searchField != null) {
                const results = this.getResults(this.props.searchBy, this.props.searchField).then();
            }
        }
    };

    public componentDidMount(){
        document.addEventListener('keydown', this.enterKeyPressed);
        if (this.props.searchField != null) {
            const results = this.getResults(this.props.searchBy, this.props.searchField).then()
        }
        const tags = this.getTags().then()
    }

    private getValidFilterValues(rows : any, columnId : any) {
        if( columnId != "tags") {
            return rows
                .map((r: { [x: string]: any; }) => r[columnId])
                .filter((item: any, i: any, a: { indexOf: (arg0: any) => void; }) => {
                    return i === a.indexOf(item);
                });
        }
        else {
            const tags = this.getTags().then(tag=> {this.setState({tags : tag})});
            let tag = this.state.tags.map(x => x.name);
            return tag
        }
    }
    
    private getRows(rows: any, filters: any) {
        const selectors = Data.Selectors;
        return selectors.getRows({ rows, filters });
    }

    private readonly getTags = async () => {
        const data = await getJSON("/api/tags");
        if (!Array.isArray(data)) {
            // Not logged in, throw exception
            throw data;
        }
        this.setState({
            tags: data
        });
        return data
    };

    private readonly getResults = async (searchBy: number, displayName: string) => {
        const data = await postJSON("/api/search/profile", {
            searchBy: searchBy,
            displayName: displayName
        });
        this.setState({rows: data.users});
        return data
    };

    public render(): ReactNode {
        const filteredRows = this.getRows(this.state.rows, this.state.filters);
        const columns = [
            { key: "displayName", name: "Name", editable: false, filterable: true, filterRenderer: AutoCompleteFilter},
            { key: "major", name: "Major", editable: false, filterable: true, filterRenderer: AutoCompleteFilter},
            { key: "tags", name: "Tags", editable: false, filterable: true, filterRenderer: AutoCompleteFilter}
        ];
        const handleFilterChange = (filter: any) => {
            const newFilters = { ...this.state.filters };
            if (filter.filterTerm) {
                newFilters[filter.column.key] = filter;
            } else {
                delete newFilters[filter.column.key];
            }
            return newFilters;
        };

        return (
            <ReactDataGrid
                columns={columns}
                rowGetter={i => filteredRows[i]}
                rowsCount={this.state.rows.length}
                rowHeight={40}
                minHeight={500}
                toolbar={<Toolbar enableFilter={true} />}
                onAddFilter={filter => this.setState({filters : handleFilterChange(filter) })}
                onClearFilters={() => this.setState({filters : {}})}
                getValidFilterValues={columnKey => this.getValidFilterValues(this.state.rows, columnKey)}
            />
        );
    }
}
