import * as React from "react";
import {Component, ReactNode} from "react";
import {BrowserRouter} from "react-router-dom";
import {Routes} from "./Routes";

/**
 * The main application class.
 */
export class App extends Component {

    /**
     * @override
     */
    public render(): ReactNode {
        return (
            <BrowserRouter>
                <Routes/>
            </BrowserRouter>
        );
    }
    
}
