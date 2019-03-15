import * as React from "react";
import {ReactNode} from "react";
import {Page} from "../Page";
import {RouteComponentProps} from "react-router";

interface Props extends RouteComponentProps {
    
}

interface State {
    
}

/**
 *
 */
export class Register extends Page<Props, State> {
    
    /**
     * @override
     */
    public render(): ReactNode {
        return <pre>This is the user registration page!</pre>;
    }

}
