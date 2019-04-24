import * as React from "react";
import {Component, ReactNode, useState} from "react";
import ReactDataGrid from 'react-data-grid';
import "./SearchResults.css"
import { Toolbar, Data, Filters } from "react-data-grid-addons"

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

export class ReactGrid extends Component<Props, State> {
    constructor(props : Props) {
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
            console.log("Filters:", this.state.filters)
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
            const tags = this.getTags().then(tag=> {this.setState({tags : tag})})
            let tag = this.state.tags.map(x => x.name)
            return tag
        }
    }
    
    private getRows(rows: any, filters: any) {
        const selectors = Data.Selectors;
        console.log("Getrows:", filters)
        return selectors.getRows({ rows, filters });
    }

    private readonly getTags = async () => {
        const response: Response = await fetch("/api/tags", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
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

    public render(): ReactNode {
        const filteredRows = this.getRows(this.state.rows, this.state.filters);
        const columns = [
            { key: "displayName", name: "Name", editable: false, filterable: true, filterRenderer: Filters.AutoCompleteFilter},
            { key: "major", name: "Major", editable: false, filterable: true, filterRenderer: Filters.AutoCompleteFilter},
            { key: "tags", name: "Tags", editable: false, filterable: true, filterRenderer: Filters.MultiSelectFilter}
        ];
        const handleFilterChange = (filter: any) => {
            const newFilters = { ...this.state.filters };
            if (filter.filterTerm) {
                newFilters[filter.column.key] = filter;
            } else {
                delete newFilters[filter.column.key];
            }
            console.log("Newfilters:", newFilters)
            return newFilters;
        };

        return (
            <ReactDataGrid
                columns={columns}
                rowGetter={i => filteredRows[i]}
                rowsCount={this.state.rows.length}
                minHeight={500}
                toolbar={<Toolbar enableFilter={true} />}
                onAddFilter={filter => this.setState({filters : handleFilterChange(filter) })}
                onClearFilters={() => this.setState({filters : {}})}
                getValidFilterValues={columnKey => this.getValidFilterValues(this.state.rows, columnKey)}
            />
        );
    }
}