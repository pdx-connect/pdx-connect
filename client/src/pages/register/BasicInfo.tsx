import * as React from "react";
import {Component, SyntheticEvent} from "react";
import {Form, InputGroup, Button} from "react-bootstrap";

import '../Register.css';

interface Props {
    handleChange: React.FormEventHandler<HTMLInputElement>;
    email: string;
    displayName: string;
    password: string;
    disabled: boolean;
    domain: string;
    resetRegistration: (e: SyntheticEvent) => void;
    passwordDisabled: boolean;
}

export class BasicInfo extends Component<Props, any> {

    /**
     * @override
     */
    public render() {
        const { handleChange, email, displayName, password, disabled, domain, resetRegistration, passwordDisabled } = this.props;
        return (
            <Form>
                <Form.Group className="form-basic">
                    <Form.Control
                        type="text"
                        placeholder="display name"
                        onChange={handleChange}
                        id="displayName"
                        className="generic"
                        value={displayName === "" ? "" : displayName}
                        disabled={disabled}
                    />
                </Form.Group>

                <Form.Group className="form-basic">
                    <InputGroup>
                        <Form.Control
                            type="email"
                            placeholder="email"
                            onChange={handleChange}
                            id="email"
                            className="generic"
                            value={email === "" ? "" : email}
                            disabled={disabled}
                        />
                        <InputGroup.Append>
                            <InputGroup.Text id="inputGroupPrepend">@{domain}</InputGroup.Text>
                        </InputGroup.Append>
                    </InputGroup>
                </Form.Group>

                <Form.Group className="form-basic">
                    <Form.Control
                        type="password"
                        placeholder="password"
                        onChange={handleChange}
                        id="password"
                        className="generic"
                        value={password === "" ? "" : password}
                        disabled={passwordDisabled}
                    />
                </Form.Group>

                {disabled?<div className="align-center"><Button variant="light" className="register-reset-button" onClick={resetRegistration}>reset</Button></div>:null}
            </Form>
        );
    }
}
