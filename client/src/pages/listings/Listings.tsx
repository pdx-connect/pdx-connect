import * as React from "react";
import {Component, ReactNode} from "react";
import {RouteChildrenProps} from "react-router";
import {Container, Row, Col, Table, Modal, Button, Form} from "react-bootstrap";
import { FaPlus, FaTrash, FaPencilAlt, FaStar, FaStarHalfAlt} from "react-icons/fa";
import Select from 'react-select';
import {ValueType} from "react-select/lib/types";
import {OptionType} from "../../components/types";
import {getJSON, postJSON} from "../../util/json";
import moment = require('moment');
import InfinityMenu from "react-infinity-menu";
import {CommentBox} from "../comments/CommentBox";

import "./react-infinity-menu.d.ts";
import "./Listings.css";



interface Node {
    name: string;
    children: Node[];
};

interface TagData {
    id: number;
    name: string;
}

interface Props extends RouteChildrenProps{
}

interface State {
    create?: boolean;
    view?: boolean;
    open: boolean;
    TagLists: {
        parent: TagData;
        children: TagData[];
    }[];
    tagTree: {
        id: number;
        name: string;
        children: Node[];
    }[];
    optionTagTypes: OptionType[];
    selectedTagType: OptionType;
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
    completed: boolean;
    filterTag: string;
    bookmarked: boolean;
    bookmarkedListings: number[];
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
            TagLists: [],
            tagTree: [],
            optionTagTypes: [],
            selectedTagType: {
                label: "",
                value: ""
            },
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
            completed: false,
            filterTag: "",
            bookmarked: false,
            bookmarkedListings: []
        };
    }

    private readonly directUserProfile = (userID: number) => {
        if(userID >= 0)
        {
            let profilePath = "/profile/" + userID;
            this.props.history.push(profilePath);
        }
        return;
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
        // Load in the default selectedTagType and optionTagTypes before loading in the modal for Type field
        this.setDefaultTypeAndTagFields();

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

    private readonly handleShowView = async (id: number) => {
        // check if selected listing is bookmarked by the user,
        // change the state of bookmark
        const data = await postJSON("/api/user/isBookmark", {
            id: id
        });
        if (data.bookmarked) {
            this.setState({ 
                bookmarked: true,
                currentViewListing: id,
                view: true
            });
        } else {
            this.setState({ 
                currentViewListing: id,
                view: true
            });
        }
    };

    private readonly handleCloseView = () => {
        this.setState({ 
            view: false,
            bookmarked: false
        });
    };

    private readonly handleEdit = () => {
        this.handleCloseView();

        var listing: any = [];
        for(let i = 0; i < this.state.listings.length; i++)
        {
            if(this.state.listings[i].id == this.state.currentViewListing)
                listing = this.state.listings[i];
        }

        // Load in the default selectedTagType and optionTagTypes before loading in the modal for Type field
        this.setDefaultTypeAndTagFields();

        // Load back in the selectedTags and optionTags before loading in the modal for Tags field
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

    private readonly handleBookmark = async (id: number) => {
        const data = await postJSON("/api/user/bookmark_listing", {
            id: id,
            bookmark: true
        });
        if (data.success) {
            let temp: number[] = this.state.bookmarkedListings;
            temp.push(id);

            this.setState({
                bookmarkedListings: temp,
                bookmarked: true
            });
        }
    }

    private readonly handleUnbookmark = async (id: number) => {
        const data = await postJSON("/api/user/bookmark_listing", {
            id: id,
            bookmark: false
        });
        if (data.success) {
            let temp: number[] = this.state.bookmarkedListings;
            let index: number = temp.indexOf(id);
            if (index !== -1)
            {
                temp.splice(index, 1);
                this.setState({
                    bookmarkedListings: temp,
                    bookmarked: false
                });
            } else {
                this.setState({
                    bookmarked: false
                });
            }
        }
    }

    // Get the user's bookmarked listings array from the DB
    private readonly updateBookmarkedListings = async () => {
        const data = await getJSON("/api/user/bookmarkedListings");
        this.setState({
            bookmarkedListings: data.bookmarkedListings
        });
    }

    // Use to set default type and tag field for create and view listing modal
    private readonly setDefaultTypeAndTagFields = () => {
        var types: OptionType[] = [];
        types.push({
            value: this.state.TagLists[0].parent.id.toString(),
            label: this.state.TagLists[0].parent.name
        })

        var options: OptionType[] = [];
        var temp: {
            id: number;
            name: string;
        }[] = this.state.TagLists[0].children;
        for(let i = 0; i < temp.length; i++)
        {
            options.push({
                value:  temp[i].id.toString(),
                label:  temp[i].name
            });
        }

        this.setState({
            selectedTagType: types[0],
            optionTags: options
        });
    }

    private readonly handleTagTypeChange = (value: ValueType<OptionType>) => {
        let type: any[] = OptionType.resolve(value);
        var temp: TagData[] = [];
        for(const tagList of this.state.TagLists)
        {
            if(tagList.parent.id == type[0].value)
                temp = tagList.children;
        }

        var options: OptionType[] = [];
        for(let i = 0; i < temp.length; i++)
        {
            options.push({
                value:  temp[i].id.toString(),
                label:  temp[i].name
            });
        }

        // If in edit mode, filter out the selected tags
        if(this.state.edit)
        {
            let temp: OptionType[] = options;
            for(const selected of this.state.selectedTags)
            {
                temp = temp.filter(x => { return x.label != selected.label; })
            }
            this.setState({
                selectedTagType: type[0],
                optionTags: temp
            });
        }
        else 
        {
            this.setState({
                selectedTagType: type[0],
                optionTags: options
            });
        }
    }

    private readonly handleTagChange = (value: ValueType<OptionType>) => {
        // Only need to manual fix tag field during edit(when there is existing selected tags)
        if(this.state.edit)
        {
            let difference = this.state.selectedTags.filter(x => !OptionType.resolve(value).includes(x));
            if(!this.isEmpty(difference))
            {
                // Get the type this tag belongs to
                let tag: any[] = OptionType.resolve(difference);
                let typeID : number = 0;
                for(const tagList of this.state.TagLists)
                {
                    for(const tags of tagList.children)
                    {
                        if(tags.id == tag[0].value)
                            typeID = tagList.parent.id;
                    }
                }
                // If the diff. tag belongs to current selected type
                if(typeID.toString() == this.state.selectedTagType.value)
                    this.state.optionTags.push(difference[0]);
            }
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
                                    <Form.Label className="listings-notComplete">Fileds incomplete</Form.Label>
                                </Form.Group>
                            : null }

                            <Form.Group>
                                <Form.Label>Title</Form.Label>
                                <Form.Control type="text" onChange={this.setTitle} value={this.state.title} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Type</Form.Label>
                                <Select
                                    options={this.state.optionTagTypes}
                                    value={this.state.selectedTagType}
                                    onChange={this.handleTagTypeChange}   
                                />
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


    private readonly showOnlyMyBookmarkedListings = async () => {
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
        const data = await getJSON("/api/tags/topParentAndChildTags");
        if (!Array.isArray(data)) {
            // Not logged in, throw exception
            throw data;
        }

        // Add all the tag types for user to select in type field
        var types: OptionType[] = [];
        for(const type of data)
        {
            types.push({
                value: type.parent.id.toString(),
                label: type.parent.name
            })
        }
        // Add to a optiontype[] in order for user to select in tag field
        var options: OptionType[] = [];
        var temp: {
            id: number;
            name: string;
        }[] = data[0].children;
        for(let i = 0; i < temp.length; i++)
        {
            options.push({
                value:  temp[i].id.toString(),
                label:  temp[i].name
            });
        }
        this.setState({
            selectedTagType: types[0],
            optionTagTypes: types,
            optionTags: options,
            TagLists: data  // All the most top level parent tag and all of its most leaf tags
        })
    };
  
    private readonly getTagTrees = async () => {
        var data = await getJSON("/api/tags/tagTree");

        let final: any[] = [];
        for(const head of data)
        {
            let temp:any[] = [];
            temp = this.traverse(head, temp);
            final.push(temp);
        }

        this.setState({
            tagTree: final,
            completed: true
        });
    };    

    // Traverse the tree and add the property "isOpen"
    private readonly traverse = (parent: any, TagTree: any[]):any[] => {
        for(const child of parent.children)
        {
            child.isOpen = false;
            let temp:any[] = this.traverse(child, TagTree);
            TagTree.push(temp);
        }
        return parent;
    }


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
            for(let i=0; i < this.state.listings.length; i++)
            {
                for(const id of this.state.bookmarkedListings)
                {
                    if(this.state.listings[i].id === id)
                        views = this.createListings(i, views);
                }
            }
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
            <tr className="listings-theListing" onClick={this.handleShowView.bind(this, this.state.listings[i].id)}>
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
            if(listing.anonymous == true)
                listing.username = "Anonymous";

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
                                <Col md={4}>
                                    {this.state.bookmarked
                                        ?
                                        <FaStar size="2vw" className="listings-bookmarkButton" onClick={this.handleUnbookmark.bind(this, listing.id)}/> 
                                        :
                                        <FaStarHalfAlt size="2vw" className="listings-bookmarkButton" onClick={this.handleBookmark.bind(this, listing.id)}/> 
                                    }
                                </Col>
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
                        {listing.anonymous
                            ? <p className="listings-listingview-directUserProfile" onClick={this.directUserProfile.bind(this, listing.userID)}>{listing.username}</p>
                            : <p className="listings-listingview-directUserProfile">{listing.username}</p>
                        }
                        <p>{moment(listing.timePosted).format("YYYY/MM/DD")}</p>
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
                                <Col md={10}></Col>
                                <Col md={1}>
                                    {editable? <FaPencilAlt size="2vw" className="listings-editButton" onClick={this.handleEdit}/> : null}
                                </Col>
                                <Col md={1}>
                                    {editable? <FaTrash size="2vw" className="listings-deleteButton" onClick={this.handleDelete}/> : null}
                                </Col>
                                {/* <Col md={3}>
                                    <Form>
                                        <Form.Group>
                                            <Button size="sm" variant="light" onClick={() => {} }>Comments</Button>
                                        </Form.Group>
                                    </Form>
                                </Col> */}
                            </Row>
                        </Container>
                    </Modal.Footer>
                    <Modal.Footer>
                        <Container>
                            <Row>
                                <CommentBox type="listing" id={listing.id} history={this.props.history} match={this.props.match} location={this.props.location} />
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
        this.updateBookmarkedListings();
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
            <Container fluid className="listings-listings">
                <Row>
                    <Col md={2}>
                        <FaPlus size="3vw" className="listings-createButton" onClick={this.handleShowCreate}/>
                    </Col>
                    <Col md={5}>Filter By ->  {this.state.filterTag}</Col>
                    <Col md={2}>
                        <Form>
                            <Form.Group>
                                <Form.Check 
                                    type="checkbox" 
                                    label="Bookmarked" 
                                    onClick={this.showOnlyMyBookmarkedListings}
                                    checked={this.state.myBookmarkedListings}
                                />
                            </Form.Group>
                        </Form>
                    </Col>
                    <Col md={3}>
                        <Form>
                            <Form.Group>
                                <Form.Check 
                                    type="checkbox" 
                                    label="My Listings" 
                                    className="listings-myListingCheckbox" 
                                    onClick={this.showOnlyMyListings}
                                    checked={this.state.myListings}
                                />
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>

                <Row>
                    <Col sm={2} className="listings-categoryCol">
                       {this.state.completed? this.createCategories() : null}
                    </Col>
                    <Col sm={10} className="listings-listingCol">
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th className="listings-ID">ID</th>
                                    <th className="listings-Title">Title</th>
                                    <th className="listings-Tags">Tags</th>
                                    <th className="listings-Author">Author</th>
                                    <th className="listings-Date">Date</th>
                                    <th className="listings-Reply">Reply</th>
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
                                    <Form.Label className="listings-notComplete">Fileds incomplete</Form.Label>
                                </Form.Group>
                            : null }

                            <Form.Group>
                                <Form.Label>Title</Form.Label>
                                <Form.Control type="text" onChange={this.setTitle} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Type</Form.Label>
                                <Select
                                    options={this.state.optionTagTypes}
                                    value={this.state.selectedTagType}
                                    onChange={this.handleTagTypeChange}
                                />
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