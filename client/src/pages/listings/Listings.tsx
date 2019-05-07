import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Table, Modal, Button, Form} from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import Select from 'react-select';
import {ValueType} from "react-select/lib/types";
import {OptionType} from "../../components/types";
import {getJSON, postJSON} from "../../util/json";
import moment = require('moment');

import List from "@material-ui/core/List";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { withStyles } from '@material-ui/core/styles';


import "./Listings.css";
import { string } from 'prop-types';


// const TAGS = [
//     [
//         {id: 0, name: "Major"},
//         {id: 1, name: "CS"},
//         {id: 2, name: "EE"}
//     ], 
//     [
//         {id: 3, name: "Commute"}, 
//         {id: 4, name: "Car"},
//         {id: 5, name: "Bus"}
//     ],
//     [
//         {id: 6, name: "Other"}
//     ]
// ];


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

    listings: {
        id: number,
        userID: number,
        username: string,
        // userProfile: UserProfile|undefined,
        title: string,
        description: string,
        tags: {
            id: number,
            name: string
        }[];
        anonymous: boolean,
        timePosted: Date,
    }[];

    currentViewListing: number;
    myListings: boolean;
    myUserID: number;
    openNested: boolean;
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
            listings: [],
            currentViewListing: 0,
            myListings: false,
            myUserID: 0,
            openNested: false
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

    // When user submit to create a new listing
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

    // Send request to create a new listing
    private readonly createListing = async (title: string, description: string, selectedTags: number[], anonymous: boolean) => {
        const data = await postJSON("/api/createListing", {
            title: title,
            description: description,
            selectedTags: selectedTags,
            anonymous: anonymous
        });
        if (data.success) {
            alert("success");
            // Update the listings panel
            this.loadAllListings();
            this.createListingsView(); 
        }
    };


    // Open the create listing modal
    private readonly handleShowCreate = () => {
        this.setState({ create: true});
    };

    // When closing the create listing modal
    private readonly handleCloseCreate = () => {
        // clear out the creating listing form
        this.setState({ 
            create: false,
            isFormIncomplete: false,
            selectedTags: [],
            title: "",
            description: "",
            anonymous: false
        });
    };

    private readonly handleShowView = (id: number) => (event:any) => {
        this.setState({ currentViewListing: id});
        this.setState({ view: true});
        this.loadViewListingModal();
    };

    private readonly handleCloseView = () => {
        this.setState({ view: false});
    };


    private readonly handleTagChange = (value: ValueType<OptionType>) => {
        this.setState({
            selectedTags: OptionType.resolve(value)
        });
    };

    private readonly handleClickNested = () => {
        this.setState(state => ({ openNested: !state.openNested }));
    };

    private readonly showOnlyMyListings = () => {
        this.setState({
            myListings: !this.state.myListings
        });
    }

    // Load in listings
    private readonly loadAllListings = async () => {
        const data = await getJSON("/api/allListings");
        this.setState({
            listings: data
        });
    };


    // Load in tags
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
        var options: OptionType[] = [];
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


    // Create the info in left column -> categories
    private readonly createCategories = () => {
        let categories = [];
        for(let i=0; i < this.state.tags.length; i++)
        {
            categories.push(
                <p key={i}>{this.state.tags[i].name}</p>
            );
        }
        return categories;
    };


    private readonly getCurrentUserId = async () => {
        const data = await getJSON("/api/user/name");
        this.setState({
            myUserID: data.userID
        });
    }

    // Create the info in the right column -> listings
    private readonly createListingsView = () => {
        let views : any = [];
       
        if(this.state.myListings)
        {
            for(let i=0; i < this.state.listings.length; i++)
            {
                if(this.state.listings[i].userID == this.state.myUserID)
                    views = this.createListings(i, views);
            }
        }
        else
        {
            for(let i=0; i < this.state.listings.length; i++)
            {
               views = this.createListings(i, views);
            }
        }       
        return views;
    }

    // Create the info in the right column -> listings (helper function)
    private readonly createListings = (i: number, views: any) => {
        var username: string = this.state.listings[i].username;
        if(this.state.listings[i].anonymous == true)
            username = "Anonymous";

        var tags: string[] = [];
        for(let j = 0; j < this.state.listings[i].tags.length; j++)
        {
            tags.push(this.state.listings[i].tags[j].name);
            if(j+1 < this.state.listings[i].tags.length)
                tags.push(', ');
        }

        views.push(
            <tr className="theListing" onClick={this.handleShowView(this.state.listings[i].id)}>
                <th>{this.state.listings[i].id}</th>
                <th>{this.state.listings[i].title}</th>
                <th>{tags}</th>
                <th>{username}</th>
                <th>{moment(this.state.listings[i].timePosted).format("YYYY/MM/DD")}</th>
                <th></th>
            </tr>
        );
        return views;
    }

    private readonly loadViewListingModal = () => {
        var listing: any = [];
        for(let i = 0; i < this.state.listings.length; i++)
        {
            if(this.state.listings[i].id == this.state.currentViewListing)
                listing = this.state.listings[i];
        }

        if(listing)
        {
            var username: string = listing.username;
            if(listing.anonymous == true)
                username = "Anonymous";

            var tags: string[] = [];
            for(let j = 0; j < listing.tags.length; j++)
            {
                tags.push(listing.tags[j].name);
                if(j+1 < listing.tags.length)
                    tags.push(', ');
            }

            let listingModal = [];
            listingModal.push(
                <Modal show={this.state.view} onHide={this.handleCloseView}>
                    <Modal.Header closeButton>
                        <Modal.Title>{listing.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group>
                                <Form.Label>{listing.title}</Form.Label>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>{listing.description}</Form.Label>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>{moment(listing.timePosted).format("YYYY/MM/DD")}</Form.Label>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>{username}</Form.Label>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>{tags}</Form.Label>
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
            );
            return listingModal;
        }
        return null;
    }



    /**
     * @override
     */
    public componentDidMount() {
        // document.addEventListener('keydown', this.enterKeyPressed);
        this.getTags().then();
        this.loadAllListings();
        this.getCurrentUserId();
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
        let listingViews = this.createListingsView();

        return (
            <Container fluid className="listings">
                <Row>
                    <Col md={2}>
                        <FaPlus size="3vw" className="createButton" onClick={this.handleShowCreate}/>
                    </Col>
                    <Col md={7}>All Listings</Col>
                    <Col md={3}>
                        <Form>
                            <Form.Group>
                                <Form.Check type="checkbox" label="My Listings" className="myListingCheckbox" onClick={this.showOnlyMyListings}/>
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
                                    <th className="ID">ID</th>
                                    <th className="Title">Title</th>
                                    <th className="Tags">Tags</th>
                                    <th className="Author">Author</th>
                                    <th className="Date">Date</th>
                                    <th className="Reply">Reply</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listingViews}
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

                {/* Popup for viewing a listing */}
                {this.state.view? this.loadViewListingModal() : null}

            </Container>
        );
    }

}