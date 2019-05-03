import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Table, Modal, Button, Form} from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import Select from 'react-select';
import {ValueType} from "react-select/lib/types";
import {OptionType} from "../../components/types";

import {getJSON, postJSON} from "../../util/json";

import "./Listings.css";



interface Props {
}

interface State {
    create?: boolean;
    view?: boolean;
    open: boolean;
    tags: {
        id: number;
        name: string;
    }[];
    optionTags: OptionType[];
    selectedTags: OptionType[];
    title: string;
    description: string;
    anonymous: boolean;
    isFormIncomplete: boolean;
}

/**
 * 
 */
export class Listings extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            create: false,
            view: false,
            open: false,
            tags: [],
            optionTags: [],
            selectedTags: [],
            title: "",
            description: "",
            anonymous: false,
            isFormIncomplete: false,
        };
    }

    // Used for creating a listing
    private readonly setTitle = (e: any) => {
        this.setState({title: e.target.value});
    };

    private readonly setDescription = (e: any) => {
        this.setState({description: e.target.value});
    };

    private readonly setAnonymous = () => {
        this.setState({anonymous: !this.state.anonymous});
    };

    private readonly processCreation = () => {
        if(this.state.title === "" || this.state.description === "" || this.state.selectedTags.length == 0) {
            this.setState({
                isFormIncomplete: true
            })
        }
        else {
            const selectedTags: number[] = this.state.selectedTags.map((option: OptionType): number => {
                const id: number = Number.parseInt(option.value);
                if (Number.isNaN(id)) {
                    throw new Error("Option value is not a number!");
                }
                return id;
            });
            this.createListing(this.state.title, this.state.description, selectedTags, this.state.anonymous).then();
            this.handleCloseCreate();
        }
    }

    private readonly createListing = async (title: string, description: string, selectedTags: number[], anonymous: boolean) => {
        const data = await postJSON("/api/createListing", {
            title: title,
            description: description,
            selectedTags: selectedTags,
            anonymous: anonymous
        });
    };


    private readonly handleShowCreate = () => {
        this.setState({ create: true});
    };

    private readonly handleCloseCreate = () => {
        this.setState({ 
            create: false,
            isFormIncomplete: false,
            selectedTags: [],
            title: "",
            description: "",
            anonymous: false
        });
    };

    private readonly handleShowView = () => {
        this.setState({ view: true});
    };

    private readonly handleCloseView = () => {
        this.setState({ view: false});
    };


    private readonly handleTagChange = (value: ValueType<OptionType>) => {
        this.setState({
            selectedTags: OptionType.resolve(value)
        });
    };


    private readonly getTags = async () => {
        const data = await getJSON("/api/tags/majors");
        if (!Array.isArray(data)) {
            // Not logged in, throw exception
            throw data;
        }
        this.setState({
            tags: data
        });

        // Add to a optiontype[] in order for users to select
        var options: OptionType[];
        options = [];
        for(let i = 0; i < this.state.tags.length; i++)
        {
            options.push({
                value:  this.state.tags[i].id.toString(),
                label:  this.state.tags[i].name
            });
        }
        this.setState({
            optionTags: options
        })      
    };


    private readonly createCategories = () => {
        let categories = [];
        for(let i=0; i < this.state.tags.length; i++)
        {
            categories.push(
                <p key={i}> {this.state.tags[i].name} </p>
            );
        }
        return categories;
    };




    /**
     * @override
     */
    public componentDidMount() {
        // document.addEventListener('keydown', this.enterKeyPressed);
        this.getTags().then();
    }
    
    /**
     * @override
     */
    public componentWillUnmount() {
        // document.removeEventListener('keydown', this.enterKeyPressed);
    }



    /**
     * @override
     */
    public render(): ReactNode {

        let categories = this.createCategories();

        return (
            <Container fluid className="listings">
                <Row>
                    <Col md={2}>
                        <FaPlus size="3vw" className="createButton" onClick={this.handleShowCreate}/>
                    </Col>
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
                    <Col sm={2} className="categoryCol">
                       {categories}
                    </Col>
                    <Col sm={10} className="listingCol">
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
                            {this.state.isFormIncomplete ?
                                <Form.Group>
                                    <Form.Label className="notComplete">Fileds incomplete</Form.Label>
                                </Form.Group>
                            : null }

                            <Form.Group>
                                <Form.Label>Title</Form.Label>
                                <Form.Control type="text" onChange={this.setTitle} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Type</Form.Label>
                                <Form.Control type="text" />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" rows="3" onChange={this.setDescription} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Tags</Form.Label>
                                <Select
                                    options={this.state.optionTags}
                                    value={this.state.selectedTags}
                                    onChange={this.handleTagChange}
                                    isMulti={true}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Check type="checkbox" label="Anonymous" onClick={this.setAnonymous} />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Form>
                            <Form.Group>
                                <Button size="sm" variant="light" onClick={this.processCreation}>Create Listing</Button>
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