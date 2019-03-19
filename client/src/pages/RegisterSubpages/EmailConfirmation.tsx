import * as React from "react";
import {Component} from "react";
import {Form} from "react-bootstrap";
import "../Register.css";



export class EmailConfirmation extends Component<any, any> {
  render() {
    const { handleChange, getEmail } = this.props;
    let email = getEmail();



    
    return (
        <div>
            <p className="blurb">
                A confirmation email was sent to:<br/>
                <span className="emailDisplay">{email}@pdx.edu</span><br/> 
                Please enter the code found in your confirmation email below.
            </p>

            <Form.Group>
                    <Form.Control 
                        type="confirmationCode" 
                        placeholder="Confirmation Code"
                        onChange={handleChange} 
                        id="confirmationCode" />
            </Form.Group>
        </div>
    );

  }

}

export default EmailConfirmation
