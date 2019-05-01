import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Table, Modal, Button, Form} from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import Select from 'react-select';

import "./Listings.css";


interface Props {
}

interface State {
    create?: boolean;
    view?: boolean;
}

/**
 * 
 */
export class Listings extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            create: false,
            view: false
        };
    }


    private readonly handleShowCreate = () => {
        this.setState({ create: true});
    };

    private readonly handleCloseCreate = () => {
        this.setState({ create: false});
    };

    private readonly handleShowView = () => {
        this.setState({ view: true});
    };

    private readonly handleCloseView = () => {
        this.setState({ view: false});
    };

  

    /**
     * @override
     */
    public render(): ReactNode {

        return (
            <Container fluid className="listings">
                <Row>
                    <Col md={2}>   
                        <FaPlus size="3vw" className="createButton" onClick={this.handleShowCreate}/>
                    </Col>
                    <Col md={10}></Col>
                </Row>
                <Row>
                    <Col md={2}>categories</Col>
                    <Col md={7}>All Listings</Col>
                    <Col md={3}>
                        <Form>
                            <Form.Group className="myListingCheckbox">
                                <Form.Check type="checkbox" label="My Listings" />
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col md={2} className="categoryCol">
                        <p>Academia</p>
                        <p>Food</p>
                        <p>Major</p>
                        <p>Transport</p>
                    </Col>
                    <Col md={10} className="listingCol">
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Date</th>
                                    <th>Tags</th>
                                    <th>Author</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th className="theListing" onClick={this.handleShowView}>free food here!</th>
                                    <th>hosting free food event</th>
                                    <th>04/02/2019</th>
                                    <th>Food</th>
                                    <th>Ivan</th>
                                </tr>
                                <tr>
                                    <th>Homework need help!!!</th>
                                    <th>need a tutor</th>
                                    <th>04/20/2019</th>
                                    <th>Computer Science</th>
                                    <th>yi</th>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>

                {/* Popup for creating a listing */}
                <Modal show={this.state.create} onHide={this.handleCloseCreate}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create a Listing</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group>
                                <Form.Label>Title</Form.Label>
                                <Form.Control type="text"/>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Type</Form.Label>
                                <Form.Control type="text"/>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" rows="3" />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Tags</Form.Label>
                                <Select
                                    // implement parameters for tags
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Check type="checkbox" label="Anonymous" />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Form>
                            <Form.Group>
                                <Button size="sm" variant="light" onClick={() => {} }>Create Listing</Button>
                            </Form.Group>
                        </Form>
                    </Modal.Footer>
                </Modal>

                {/* Popup for viewing the listing */}
                <Modal show={this.state.view} onHide={this.handleCloseView}>
                    <Modal.Header closeButton>
                        <Modal.Title>free food here!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group>
                                <Form.Label>free food here!</Form.Label>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>hosting free food event</Form.Label>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>04/02/2019</Form.Label>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Ivan</Form.Label>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Tags: Food</Form.Label>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Form>
                            <Form.Group>
                                <Button size="sm" variant="light" onClick={() => {} }>Comments</Button>
                            </Form.Group>
                        </Form>
                    </Modal.Footer>
                </Modal>


            </Container>
        );
    }

}