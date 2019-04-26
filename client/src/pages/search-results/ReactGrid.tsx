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
    reset: any;
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
            filters: {},
            reset: 0
        };
    }
    
    private readonly enterKeyPressed = (e: any) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            if (this.props.searchField != null) {
                const results = this.getResults(this.props.searchBy, this.props.searchField).then();
            }
            this.setState({reset: this.state.reset + 1})
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
            this.getTags().then(tag=> {this.setState({tags : tag})});
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

    private readonly getResults = async (searchBy: number, searchString: string) => {
        const data = await postJSON("/api/search/profile", {
            searchBy: searchBy,
            displayName: searchString,
            title: searchString
        });
        this.setState({rows: data.users});
        return data
    };

    public render(): ReactNode {
        const filteredRows = this.getRows(this.state.rows, this.state.filters);
        let columns : any
        if (this.props.searchBy == 1){
            columns = [
                { key: "displayName", name: "Name", editable: false, filterable: true},
                { key: "major", name: "Major", editable: false, filterable: true, filterRenderer: AutoCompleteFilter},
                { key: "tags", name: "Tags", editable: false, filterable: true, filterRenderer: MultiSelectFilter}
            ];
        }
        if (this.props.searchBy == 2 || this.props.searchBy == 3){
            columns = [
                { key: "title", name: "Title", editable: false, filterable: true},
                { key: "startDate", name: "Start Date", editable: false, filterable: true, filterRenderer: AutoCompleteFilter},
                { key: "description", name: "Description", editable: false, filterable: true}
            ];
        }
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
            <div key={this.state.reset}>
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
            </div>
        );
    }
}
