import * as React from "react";
import {Component, ReactNode} from "react";
import {Button} from "react-bootstrap";
import "./Login.css";

/**
 * 
 */
export class Login extends Component {

    /**
     * @override
     */
    public render(): ReactNode {
        return (
            <div>
                <pre>This is the login page!</pre>
                <Button>Login</Button>
            </div>
        );
    }

}
