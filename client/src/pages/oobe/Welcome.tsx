import * as React from "react";
import {Component} from "react";
import {Container, Row, Col} from "react-bootstrap";
import "./oobe.css";

interface Props {
}

export class Welcome extends Component<Props, any> {
    
    /**
     * @override
     */
    public render() {

        return (
            <Container fluid className="welcome alignCenter">
                <Row>
                    <Col sm={12}>
                            <p>
                                Ut eu arcu malesuada, eleifend turpis non, molestie mauris. Curabitur tincidunt
                                tincidunt condimentum.
                                Cras aliquam felis eu velit posuere, eget facilisis urna facilisis. Donec consequat
                                faucibus ante, nec
                                lobortis ipsum scelerisque et. Mauris non nunc in dolor venenatis aliquam ut non sem.
                                Nam dictum, nisl eu eleifend egestas,
                                eros lectus semper sem, a lacinia nisl turpis quis mauris. Morbi lacinia nunc libero.
                            </p>
                    </Col>
                </Row>
            </Container>
        );
    }

}
