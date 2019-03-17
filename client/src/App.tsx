import * as React from "react";
import {Component, ReactNode} from "react";
import {BrowserRouter} from "react-router-dom";
import {Routes} from "./Routes";
import {hot} from "react-hot-loader/root";

/**
 * The main application class.
 */
class App extends Component {

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

const hotApp = hot(App);
export { hotApp as App };
