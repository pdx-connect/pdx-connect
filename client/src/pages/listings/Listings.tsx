import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Table, Modal, Button, Form, Collapse} from "react-bootstrap";
import { FaPlus, FaTrash, FaPencilAlt} from "react-icons/fa";
import Select from 'react-select';
import {ValueType} from "react-select/lib/types";
import {OptionType} from "../../components/types";
import {getJSON, postJSON} from "../../util/json";
import moment = require('moment');
import InfinityMenu from "react-infinity-menu";

import "./Listings.css";
import { collapseDuration } from 'react-select/lib/animated/transitions';



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
        id: number;
        name: string;
        isOpen: boolean;
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
    myBookmarkedListings: boolean;
    myUserID: number;
    edit: boolean;
    categoriesList: any[];
    collapseHeader: {
        id: number;
        show: boolean;
    }[];

    completed: boolean;
    filterTag: string;
}

/**
 * 
 */
export class Listings extends Component<Props, State>{
    
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
            myBookmarkedListings: false,
            myUserID: 0,
            edit: false,
            categoriesList: [],
            collapseHeader: [],
            completed: false,
            filterTag: ""
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
        let temp: OptionType[] = this.state.optionTags;
        for(const selected of selectedTags)
        {
            temp = temp.filter(x => { return x.label != selected.label; })
        }

        this.setState({
            optionTags: temp,
            selectedTags: selectedTags,
            title: listing.title,
            description: listing.description,
            anonymous: listing.anonymous,
            edit: true
        })
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
        // Get the remove tag, add back to options
        let difference = this.state.selectedTags.filter(x => !OptionType.resolve(value).includes(x));
        if(!this.isEmpty(difference))
        {
            for(const dif of difference)
                this.state.optionTags.push(dif);
        }

        this.setState({
            selectedTags: OptionType.resolve(value)
        });
    };

    // Check if object is empty
    private readonly isEmpty = (obj: any[]) => {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

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
            myListings: !this.state.myListings,
            filterTag: "",
            myBookmarkedListings: false
        });
    }


    private readonly showOnlyMyBookmarkedListings = () => {
        this.setState({
            myBookmarkedListings: !this.state.myBookmarkedListings,
            filterTag: "",
            myListings: false
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

        // Add to a optiontype[] in order for users to select
        var options: OptionType[] = [];
        var temp: {
            id: number;
            name: string;
        }[] = data;
        for(let i = 0; i < temp.length; i++)
        {
            options.push({
                value:  temp[i].id.toString(),
                label:  temp[i].name
            });
        }
        this.setState({
            optionTags: options,
            tags: data
        })
    };
  
    private readonly getTagTrees = async () => {
        const data = await getJSON("/api/tags/tagTree");

        this.setState({
            tagTree: data,
            completed: true
        });
    };    


    private readonly onNodeMouseClick = (event:any, tree:any, node:any, level:any, keyPath:any) => {
        // For filter behaviors
        if(node.children.length == 0)
        {
            // Get the new listings view by setting state of filterTag
            if(this.state.filterTag === node.name)
            {
                this.setState({
                    filterTag: ""
                });
            }
            else
            {
                this.setState({
                    tagTree: tree,
                    filterTag: node.name,
                    myListings: false,
                    myBookmarkedListings: false
                });
            }
        }
        else    // For normal collapse behaviors
        {
            this.setState({
                tagTree: tree
            });
        }
	}

    // Create the info in left column -> categories
    private readonly createCategories = () => {
        let categorieView: any[] = [];
        
        categorieView.push(
            <InfinityMenu
                tree={this.state.tagTree}
                onNodeMouseClick={this.onNodeMouseClick}
            />
        );
        return categorieView;
    };


    // Helper function for createCategories
    // private readonly traverse = (parent: any, categorieView: any[], index: number): any[] => {
    //     // Create a collapsable row for parent(has children)
    //     if(parent.children.length > 0)
    //     {
    //         for(const child of parent.children)
    //         {
    //             let temp1: any[] = [];
    //             temp1 = this.traverse(child, temp1, index);
    //             categorieView.push(temp1);
    //         }
    //         let temp2: any[] = [];
            // let location = this.findIndexLocation(parent.id);
            // temp2.push(
            //     <div>
            //         <h6 className="parentTag" onClick={this.handleIvan}>
            //             {parent.name}
            //         </h6>
            //         {this.state.ivan?
            //             <div>
            //                 <ul className="childTag">{categorieView}</ul>
            //             </div>
            //         : null}
            //     </div>
            // );
            // temp2.push(
            //     <Collapse in={this.state.collapseHeader[location].show}>
            //         <ul className="childTag">{categorieView}</ul>
            //     </Collapse>
            // );
    //         categorieView = [];
    //         categorieView.push(temp2);
    //     }
    //     else
    //     {
    //         categorieView.push(
    //             <li>{parent.name}</li>
    //         );
    //     }
    //     return categorieView;
    // }

    // private readonly findIndexLocation = (id: number): number => {
    //     let temp: any[] = this.state.collapseHeader;
    //     for(let i = 0; i < temp.length; i++)
    //     {
    //         if(temp[i].id == id)
    //             return i;
    //     }
    //     return -1;
    // }

    // private readonly handleCollapse = (location: number) => {
    //     let temp: any[] = this.state.collapseHeader;
    //     temp[location].show = !this.state.collapseHeader[location].show;
        
    //     this.setState({
    //         collapseHeader: temp,
    //         ivan: !this.state.ivan
    //     })
    // }

    // Set the array of show options for the category headers, 
    // add default to false (not expanding)
    // private readonly setHeaderNum = (tagTree: any[]) => {
    //     let temp: any[];
    //     let headerArray: any[] = [];
    //     for(const subtree of tagTree)
    //     {
    //         temp = [];
    //         temp = this.findHeaderNum(subtree, temp);
    //         for(const i of temp)
    //             headerArray.push(i);
    //     }

    //     this.setState({
    //         collapseHeader: headerArray
    //     })
    // }

    // private readonly findHeaderNum = (parent: any, headerArray: any[]): any[] => {
    //     if(parent.children.length > 0)
    //     {   
    //         for(const child of parent.children)
    //         {
    //             headerArray = this.findHeaderNum(child, headerArray);
    //         }
    //         headerArray.push({
    //             id: parent.id,
    //             show: false
    //         });
    //     }
    //     return headerArray;
    // }


    private readonly getCurrentUserId = async () => {
        const data = await getJSON("/api/user/name");
        this.setState({
            myUserID: data.userID
        });
    }

    // Create the info in the right column -> listings
    private readonly createListingsView = () => {
        let views : any = [];
       

        if(this.state.myListings)   // Show only my listings
        {
            for(let i=0; i < this.state.listings.length; i++)
            {
                if(this.state.listings[i].userID == this.state.myUserID)
                    views = this.createListings(i, views);
            }
        }
        else if(this.state.myBookmarkedListings)    // Show only my bookmarked listings
        {

        }
        else if(this.state.filterTag)   // Show filtered listings
        {
            for(let i=0; i < this.state.listings.length; i++)
            {
                for(const tag of this.state.listings[i].tags)
                {
                    if(tag.name === this.state.filterTag)
                        views = this.createListings(i, views);
                }
            }
        }
        else    // Show all listings
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

        let listingViews = this.createListingsView();

        return (
            <Container fluid className="listings">
                <Row>
                    <Col md={2}>
                        <FaPlus size="3vw" className="createButton" onClick={this.handleShowCreate}/>
                    </Col>
                    <Col md={6}>Filter By ->  {this.state.filterTag}</Col>
                    <Col md={2}>
                        <Form>
                            <Form.Group>
                                <Form.Check 
                                    type="checkbox" 
                                    label="Interested" 
                                    onClick={this.showOnlyMyBookmarkedListings}
                                    checked={this.state.myBookmarkedListings}
                                />
                            </Form.Group>
                        </Form>
                    </Col>
                    <Col md={2}>
                        <Form>
                            <Form.Group>
                                <Form.Check 
                                    type="checkbox" 
                                    label="My Listings" 
                                    className="myListingCheckbox" 
                                    onClick={this.showOnlyMyListings}
                                    checked={this.state.myListings}
                                />
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>

                <Row>
                    <Col sm={2} className="categoryCol">
                       {this.state.completed? this.createCategories() : null}
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