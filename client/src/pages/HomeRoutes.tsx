import * as React from "react";
import {Component, ReactNode} from "react";
import {Redirect, Route, Switch} from "react-router";
import {Home} from "./Home";

/**
 * Authenticated routes.
 */
export class HomeRoutes extends Component {
    
    /**
     * @override
     */
    public render(): ReactNode {
        return (
            <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/profile" component={Home} />
                <Route path="/calendar" component={Home} />
                <Route path="/listings" component={Home} />
                <Route path="/inbox" component={Home} />
                <Route path="/settings" component={Home} />
                <Redirect to="/" />
            </Switch>
        );
    }

}
