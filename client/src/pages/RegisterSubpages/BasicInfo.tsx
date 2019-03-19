import * as React from "react";
import {Component} from "react";
import {Form, InputGroup} from "react-bootstrap";
import '../Register.css';



class BasicInfo extends Component<any, any> {
  render() {

    const { handleChange } = this.props;

    return (
        <Form>
          <Form.Group>
              <Form.Control 
                type="email" 
                placeholder="username" 
                onChange={handleChange}
                id="username"
              />
          </Form.Group>

          <Form.Group>
              <Form.Control 
                type="password" 
                placeholder="password" 
                onChange={handleChange} 
                id="password"
              />
          </Form.Group>

          <Form.Group>
              <InputGroup>
                  <Form.Control 
                    type="email" 
                    placeholder="email" 
                    onChange={handleChange} 
                    id="email"
                  />
                  <InputGroup.Append>
                      <InputGroup.Text id="inputGroupPrepend">@pdx.edu</InputGroup.Text>
                  </InputGroup.Append>
              </InputGroup>
          </Form.Group>
        </Form>
    );
  }
}
export default BasicInfo
