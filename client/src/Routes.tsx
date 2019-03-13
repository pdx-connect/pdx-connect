import * as React from "react";
import {Component, ReactNode} from "react";
import {Redirect, Route, Switch} from "react-router";
import {Home} from "./pages/Home";
import {Login} from "./pages/Login";
import {Register} from "./pages/Register";

/**
 * The main application class.
 */
export class Routes extends Component {

    /**
     * @override
     */
    public render(): ReactNode {
        return (
            <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Redirect to="/" />
            </Switch>
        );
    }

}