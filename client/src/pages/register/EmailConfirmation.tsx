import * as React from "react";
import {Component, SyntheticEvent} from "react";
import {Form, Button} from "react-bootstrap";
import {FormControlProps} from "../../components/types";
import "../Register.css";

interface Props {
    handleChange: React.FormEventHandler<FormControlProps>;
    email: string;
    confirmCode: (e: SyntheticEvent) => void;
    resendCode: (e: SyntheticEvent) => void;
    confirmed: boolean;
    domain: string;
}

export class EmailConfirmation extends Component<Props, any> {

    /**
     * @override
     */
    public render() {
        const { handleChange, email, confirmCode, resendCode, confirmed, domain } = this.props;
        return (
            <div className="register-email-confirmation">
                <p className="register-blurb">
                    A confirmation email was sent to:<br/>
                    <span className="register-email-display">{email}@{domain}</span><br/>
                    Please enter the code found in your confirmation email below.
                </p>
                <Form.Group className="basic-form">
                    <Form.Control
                        id="confirmationCode"
                        type="text"
                        placeholder="Confirmation Code"
                        onChange={handleChange}
                        className="generic"
                    />
                </Form.Group>
                {confirmed ?
                    <div className="register-confirmed">Confirmed</div>:
                    <div>
                        <Button variant="light" className="register-confirm-button" onClick={confirmCode}>confirm</Button>
                        <Button variant="light" className="register-resend-button" onClick={resendCode}>resend</Button>
                    </div>
                }
            </div>
        );
    }

}
