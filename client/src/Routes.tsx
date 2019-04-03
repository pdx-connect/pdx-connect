import * as React from "react";
import {Component, ReactNode} from "react";
import {Route, Switch} from "react-router";
import {Home} from "./pages/Home";
import {Login} from "./pages/Login";
import {Register} from "./pages/Register";
import {Reset} from "./pages/Reset";

/**
 * Top-level routes for the application.
 */
export class Routes extends Component {

    /**
     * @override
     */
    public render(): ReactNode {
        return (
            <Switch>
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/reset" component={Reset} />
                <Route component={Home} />
            </Switch>
        );
    }

}
