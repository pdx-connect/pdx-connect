import * as React from "react";
import {Component} from "react";
import {Container, Row, Col, Form, Button, Jumbotron} from "react-bootstrap";
import "../Register.css";


export class Agreement extends Component<any, any> {

  render() {
    const { handleCheck, getTos, handleJoin } = this.props;

    let checked = getTos();
    return (
        <Container fluid className="agreement">
            <Row>
                <Col sm={12}>
                <Jumbotron className="tos">
                    <h3>Terms of Service</h3>
                    <p>
                    Ut eu arcu malesuada, eleifend turpis non, molestie mauris. Curabitur tincidunt tincidunt condimentum.
                    Cras aliquam felis eu velit posuere, eget facilisis urna facilisis. Donec consequat faucibus ante, nec
                    lobortis ipsum scelerisque et. Mauris non nunc in dolor venenatis aliquam ut non sem. Nam dictum, nisl eu eleifend egestas,
                    eros lectus semper sem, a lacinia nisl turpis quis mauris. Morbi lacinia nunc libero.
                    </p>
                    <Form.Check type="checkbox" defaultChecked={checked} label="I Agree" onClick={handleCheck}/>
                    {checked? <Row><Col sm={12} className="submit"><Button variant="light" className="joinButton" onClick={handleJoin}>join</Button></Col></Row>:null}
                </Jumbotron>
                        
                </Col>
            </Row>
            
        </Container>

    );

  }

}

export default Agreement
