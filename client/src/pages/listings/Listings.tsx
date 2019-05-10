import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Table, Modal, Button, Form} from "react-bootstrap";
import { FaPlus, FaTrash, FaPencilAlt} from "react-icons/fa";
import Select from 'react-select';
import {ValueType} from "react-select/lib/types";
import {OptionType} from "../../components/types";
import {getJSON, postJSON} from "../../util/json";
import moment = require('moment');


import "./Listings.css";


// Collapsible Categories list w/ filter function
// Where to put the listing edit symbol?
    // Edit the listing w/ modal
// Modal -> description: import pictures

interface Node {
    name: string;
    children: Node[];
};

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
    tagTree: {
        name: string;
        children: Node[];
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
    edit: boolean;
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
            tagTree: [],
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
            edit: false
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
        const data = await postJSON("/api/listings/createListing", {
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
        // this.loadViewListingModal();
    };

    private readonly handleCloseView = () => {
        this.setState({ view: false});
    };

    private readonly handleEdit = () => {
        this.handleCloseView();

        var listing: any = [];
        for(let i = 0; i < this.state.listings.length; i++)
        {
            if(this.state.listings[i].id == this.state.currentViewListing)
                listing = this.state.listings[i];
        }
        // Load back in the selectedTags and optionTags before loading in the modal
        const selectedTags: OptionType[] = [];
        for (const tag of listing.tags)
        {
            selectedTags.push({
                value: tag.id,
                label: tag.name
            })
        }
        this.handleTagChange(selectedTags);
        this.setState({
            title: listing.title,
            description: listing.description,
            anonymous: listing.anonymous
        })

        this.setState({ edit: true });
        // this.loadEditListingModal();
    };

    private readonly handleCloseEdit = () => {
        // clear out the editing listing form
        this.setState({ 
            edit: false,
            isFormIncomplete: false,
            selectedTags: [],
            title: "",
            description: "",
            anonymous: false
        });
    };


    private readonly handleDelete = async () => {
        const data = await postJSON("/api/listings/delete_listing", {
            id: this.state.currentViewListing
        });
        if (data.success) {
            this.handleCloseView();
            alert("Delete Successfully!");
            // Update the listings panel
            this.loadAllListings();
            this.createListingsView(); 
        }
    };


    private readonly handleTagChange = (value: ValueType<OptionType>) => {
        this.setState({
            selectedTags: OptionType.resolve(value)
        });
    };


    // Create the edit listing modal
    private readonly loadEditListingModal = () => {
        var listing: any = [];
        for(let i = 0; i < this.state.listings.length; i++)
        {
            // Get the listing user clicked
            if(this.state.listings[i].id == this.state.currentViewListing)
                listing = this.state.listings[i];
        }

        if(listing)
        {
            let listingModal = [];
            listingModal.push(
                // Create a editable modal with current listing data
                <Modal show={this.state.edit} onHide={this.handleCloseEdit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit a Listing</Modal.Title>
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
                                <Form.Control type="text" onChange={this.setTitle} value={this.state.title} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Type</Form.Label>
                                <Form.Control type="text" disabled/>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" rows="3" onChange={this.setDescription} value={this.state.description} />
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
                                <Form.Check type="checkbox" label="Anonymous" onClick={this.setAnonymous} defaultChecked={this.state.anonymous}/>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Form>
                            <Form.Group>
                                <Button size="sm" variant="light" onClick={this.processEditing}>Edit Listing</Button>
                            </Form.Group>
                        </Form>
                    </Modal.Footer>
                </Modal>
            );
            return listingModal;
        }
        return null;
    }

    // When user submit to edit a new listing
    private readonly processEditing = () => {
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
            this.editListing(this.state.title, this.state.description, selectedTags, this.state.anonymous).then();
            this.handleCloseEdit();
        }
    }

    // Send request to edit the listing
    private readonly editListing = async (title: string, description: string, selectedTags: number[], anonymous: boolean) => {
        const data = await postJSON("/api/listings/edit_listing", {
            id: this.state.currentViewListing,
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


    private readonly showOnlyMyListings = () => {
        this.setState({
            myListings: !this.state.myListings
        });
    }

    // Load in listings
    private readonly loadAllListings = async () => {
        const data = await getJSON("/api/listings/allListings");
        this.setState({
            listings: data
        });
    };


    // Load in tags
    private readonly getTags = async () => {
        const data = await getJSON("/api/tags/allBaseTags");
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
  
    private readonly getTagTrees = async () => {
        const data = await getJSON("/api/tags/tagTree");
        this.setState({
            tagTree: data
        })
        console.log(this.state.tagTree);
    };

    // Create the info in left column -> categories
    private readonly createCategories = () => {
        let categorieView: any[] = [];
        let finalView: any[] = [];

        this.traverse(this.state.tagTree, categorieView);
        console.log(categorieView);
        return categorieView;

        // finalView.push(
        //     <ul> 
        //         {categorieView}
        //     </ul>
        // );
        // console.log(finalView);
        // return finalView;
    };

    // Helper function for createCategories
    private readonly traverse = (parents: Node[], categorieView: any[]) => {
        for(const parent of parents) {
            // Create a collapsable row for parent(has children)
            if(parent.children.length > 0)
            {
                categorieView.push(
                    <h6 className="parentTag">{parent.name}</h6>
                );
                this.traverse(parent.children, categorieView);
            }
            else
            {
                categorieView.push(
                    <p>{parent.name}</p>
                );
            }
        }
    }


    private readonly getCurrentUserId = async () => {
        const data = await getJSON("/api/user/name");
        this.setState({
            myUserID: data.userID
        });
    }

    // Create the info in the right column -> listings
    private readonly createListingsView = () => {
        let views : any = [];
       
        // Show only my listings
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
            // Show all listings
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
            // Get the listing user clicked on
            if(this.state.listings[i].id == this.state.currentViewListing)
                listing = this.state.listings[i];
        }

        if(listing)
        {
            var username: string = listing.username;
            if(listing.anonymous == true)
                username = "Anonymous";

            var tags: string[] = [];
            for (const tag of listing.tags)
            {
                tags.push(tag.name);
                tags.push("  ");
            }

            // Condition to check if current user owns current view listing
            var editable = false;
            if(listing.userID == this.state.myUserID)
                editable = true;

            let listingModal = [];
            listingModal.push(
                <Modal show={this.state.view} onHide={this.handleCloseView}>
                    <Modal.Header closeButton>
                        <Container>
                            <Row>
                                <Col md={4}></Col>
                                <Col md={4}>
                                    <Modal.Title>{listing.title}</Modal.Title>
                                </Col>
                                <Col md={4}></Col>
                            </Row>
                        </Container>
                    </Modal.Header>
                    <Modal.Body>
                        <h6>Description: {listing.description}</h6>
                        <br />
                        <p>{username} {moment(listing.timePosted).format("YYYY/MM/DD")}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Container>
                            <Row>
                                <Col md={3}></Col>
                                <Col md={6}>
                                    {tags}
                                </Col>
                                <Col md={3}></Col>
                            </Row>
                        </Container>
                    </Modal.Footer>
                    <Modal.Footer>
                        <Container>
                            <Row>
                                <Col md={1}>
                                    {editable? <FaPencilAlt size="1vw" className="editButton" onClick={this.handleEdit}/> : null}
                                </Col>
                                <Col md={1}>
                                    {editable? <FaTrash size="1vw" className="deleteButton" onClick={this.handleDelete}/> : null}
                                </Col>
                                <Col md={7}></Col>
                                <Col md={3}>
                                    <Form>
                                        <Form.Group>
                                            <Button size="sm" variant="light" onClick={() => {} }>Comments</Button>
                                        </Form.Group>
                                    </Form>
                                </Col>
                            </Row>
                        </Container>
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
        this.getTagTrees();
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
                                <Form.Control type="text" disabled/>
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

                {/* Popup for editing a listing */}
                {this.state.edit? this.loadEditListingModal() : null}

            </Container>
        );
    }

}