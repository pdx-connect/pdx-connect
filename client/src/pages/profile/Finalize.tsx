import * as React from "react";
import {Component} from "react";
import {Container, Row, Col, Button} from "react-bootstrap";
import "./Profile.css";

interface Props {
    finalize: () => void;
}

export class Finalize extends Component<Props, any> {
    
    /**
     * @override
     */
    public render() {

        const { finalize } = this.props;

        return (
            <Container fluid className="finalize alignCenter">
                <Row>
                    <Col sm={12}>
                            <Button variant="light" className="finalizeButton" onClick={finalize}>Connect</Button>
                    </Col>
                </Row>
            </Container>
        );
    }

}
