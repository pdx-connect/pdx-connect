import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Table, Modal, Button} from "react-bootstrap";
import {FaPencilAlt, FaTrash} from "react-icons/fa";
import {getJSON, postJSON} from "../../util/json";

interface Props {
    listings: Listing[];
    updateUserProfile: () => void;
}

interface State {
    showEditListing: boolean;
    listing: Listing | undefined;
}

interface Listing {
    anonymous: boolean;
    deleted: number;
    description: string;
    id: number;
    timePosted: string;
    title: string;
    userID: number;
}

/**
 * 
 */
export class Listings extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            showEditListing: false,
            listing: undefined
        };
    }

    private readonly updateListing = (listingID: number, index: number) => {
        this.setState({
            showEditListing: true,
            listing: this.props.listings[index]
        });
    }

    private readonly removeListing = (listing: Listing | undefined) => {
       if(listing!= undefined) {
           this.deleteListing(listing.id);
       }
    }

    private readonly deleteListing = async (listingID: number) => {
        const data = await postJSON("/api/listings/delete_listing", {id: listingID});
        
        console.log('data: ', data);
        if(data.success) {
            this.props.updateUserProfile();
            this.setState({showEditListing: false});
        }

    }

    private readonly createListings = (listings: Listing[]) => {
        let listingGrid = [];

        for(let i = 0; i < listings.length; i++)
        {
            let date = new Date(listings[0].timePosted);

            listingGrid.push(
                <tr key={i} onClick={() => this.updateListing(listings[0].id, i)} className="profile-my-listings">
                    <td className="profile-my-listings-title">{listings[0].title}</td>
                    <td className="profile-my-listings-timePosted">{date.toDateString()}</td>
                    <td className="profile-my-listings-description">{listings[0].description}</td>
                </tr>
            );
        }

        return listingGrid;
    }



    public render(): ReactNode {
        let listings = this.createListings(this.props.listings);
        let listing = this.state.listing;
        
        let hideEditButtons = true;

        if(listing != undefined) {
            hideEditButtons= listing.deleted === 1? true: false;

        }
        
        return (
            <Container fluid className="profile-listings">
                <Row>
                    <Col sm={12}><h3 className="profile-sub-title mt-1">my listings</h3></Col>
                </Row>
                <Row>
                    <Col sm={12}>
                    <Table striped responsive="sm" className="profile-my-listings-table">
                        <thead className="profile-my-listings-table-header">
                            <tr key={1}>
                                <th>
                                    title
                                </th>
                                <th>
                                    posted
                                </th>
                                <th>
                                    description
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {listings}
                        </tbody>
                    </Table>
                    </Col>
                </Row>
                <Modal size="lg" show={this.state.showEditListing} onHide={() => this.setState({ showEditListing: false })} dialogClassName="profile-my-events-modal" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>My Listing</Modal.Title>
                </Modal.Header>
                    <Modal.Body>
                        {listing != undefined?
                            <div>
                                <span>anonymous: {listing.anonymous}</span>
                                <span>deleted: {listing.deleted}</span>
                                <span>description: {listing.description}</span>
                                <span>id: {listing.id}</span>
                                <span>timePosted: {listing.timePosted}</span>
                                <span>title: {listing.title}</span>
                                <span>userID: {listing.userID}</span>
                            </div>
                            :
                            null
                        }
                        {hideEditButtons === true? null
                        :
                        <div>
                            <FaPencilAlt className="profile-fa-icon ml-auto pl-1 mt-1" size="2vw" />
                            <FaTrash className="profile-fa-icon ml-auto" size="2vw" onClick={() => this.removeListing(listing)} />
                        </div>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        {hideEditButtons === true? null : <Button variant="light">save</Button>}
                    </Modal.Footer>
                </Modal>
        </Container>
        );
    }

}
