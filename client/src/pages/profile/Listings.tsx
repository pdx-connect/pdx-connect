import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Table, Modal, Button} from "react-bootstrap";
import {FaPencilAlt, FaTrash} from "react-icons/fa";
import {getJSON, postJSON} from "../../util/json";

interface Props {
    listings: Listing[];
    updateUserProfile: () => void;
    displayName: string;
}

interface State {
    showEditListing: boolean;
    listing: Listing | undefined;
}

interface Listing {
    anonymous: number;
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
        let postingDate = "";
        let poster = this.props.displayName;

        if(listing != undefined) {
            hideEditButtons= listing.deleted === 1? true: false;
            postingDate = new Date(listing.timePosted).toDateString();
            poster = listing.anonymous === 1? "Posted Anonymously" : this.props.displayName;
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
                                    post date
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
                <Modal size="lg" show={this.state.showEditListing} onHide={() => this.setState({ showEditListing: false })} className="profile-my-events-modal" backdrop="static">
                <Modal.Header closeButton>
                    <div className="profile-modal-header">
                        <span className="profile-modal-title">my listing</span>
                        <span className="profile-modal-sub-title">{listing != undefined? listing.title : "My Listing"}</span>
                    </div>
                </Modal.Header>
                    <Modal.Body>
                        {listing != undefined?
                            <Container fluid>
                                <Row className="pb-3">
                                    <Col sm={4} className="profile-label">Poster</Col>
                                    <Col sm={8} className="profile-listing-content">{poster}</Col>
                                </Row>
                                <Row className="pb-3">
                                    <Col sm={4} className="profile-label">description</Col>
                                    <Col sm={8} className="profile-listing-content">{listing.description}</Col>
                                </Row>
                                <Row className="pb-3">
                                    <Col sm={4} className="profile-label">posting date</Col>
                                    <Col sm={8} className="profile-listing-content">{postingDate}</Col>
                                </Row>
                            </Container>
                            :
                            null
                        }
                    </Modal.Body>
                        {hideEditButtons === true?
                        <div className="profile-modal-footer text-center"><span className="profile-modal-footer-content-center">this listing was deleted and cannot be edited</span></div>
                            :
                            <div className="profile-modal-footer">
                                <span className="profile-modal-footer-content-left">
                                    <FaPencilAlt className="profile-fa-icon" size="2vw" />
                                    <FaTrash className="profile-fa-icon" size="2vw" onClick={() => this.removeListing(listing)} />
                                </span>
                                <span className="profile-modal-footer-content-right"><Button variant="light">save</Button></span>
                            </div>
                        }
                </Modal>
        </Container>
        );
    }

}
