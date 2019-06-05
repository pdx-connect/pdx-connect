import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Table, Modal} from "react-bootstrap";
import {FaPencilAlt, FaTrash} from "react-icons/fa";
import Select from 'react-select';
import {OptionType} from "../../components/types";
import {postJSON} from "../../util/json";
import {RouteChildrenProps} from 'react-router';


interface Props extends RouteChildrenProps {
    listings: Listing[];
    updateUserProfile: () => void;
    displayName: string;
    userID?: number;
}

interface State {
    showListingView: boolean;
    listing: Listing | undefined;
}

interface Listing {
    anonymous: number;
    deleted: number;
    description: string;
    id: number;
    datePosted: string;
    title: string;
    userID: number;
    tags: Tag[]
}

interface Tag {
    id: number;
    name: string;
}

/**
 * 
 */
export class Listings extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            showListingView: false,
            listing: undefined
        };
    }

    private editListing = (listing: Listing | undefined) => {
        if (listing != null) {
            this.props.history.push({
                pathname: '/listings',
                search: '?listingid=' + listing.id
            });
        } else {
            this.setState({
                showListingView: false
            });
        }
    };

    private readonly viewListing = (listingID: number, index: number) => {
        this.setState({
            listing: this.props.listings[index],
            showListingView: true,
        })
    };

    private readonly removeListing = (listing: Listing | undefined) => {
        if (listing != null) {
            this.deleteListing(listing.id).then();
        } else {
            this.setState({
                showListingView: false
            });
        }
    };

    private readonly deleteListing = async (listingID: number) => {
        const data = await postJSON("/api/listings/delete_listing", {id: listingID});
        if (data.success) {
            this.props.updateUserProfile();
            this.setState({
                showListingView: false
            });
        }
    };

    private readonly createListings = (listings: Listing[]) => {
        let listingGrid = [];

        for(let i = 0; i < listings.length; i++)
        {
            let date = new Date(listings[i].datePosted);

            listingGrid.push(
                <tr key={i} onClick={() => this.viewListing(listings[i].id, i)} className="profile-my-listings">
                    <td className="profile-my-listings-title">{listings[i].title}</td>
                    <td className="profile-my-listings-timePosted">{date.toDateString()}</td>
                    <td className="profile-my-listings-description">{listings[i].description}</td>
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
        let tags: OptionType[] = [];


        if(listing != undefined) {
            hideEditButtons= listing.deleted === 1? true: false;
            postingDate = new Date(listing.datePosted).toDateString();
            poster = listing.anonymous === 1? "Posted Anonymously" : this.props.displayName;

            tags = listing.tags.map((t: { id: number; name: string; }) => {
                let option: OptionType = {
                    value: t.id.toString(),
                    label: t.name
                };
                return option;
            });
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
                <Modal size="lg" show={this.state.showListingView} onHide={() => this.setState({ showListingView: false })} className="profile-my-events-modal" backdrop="static">
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
                                <Row className="pb-3">
                                    <Col sm={4} className="profile-label">tags</Col>
                                    <Col sm={8} className="profile-listing-tags">
                                        <Select
                                            options={tags}
                                            isDisabled={true}
                                            isMulti={true}
                                            value={tags}
                                            placeholder={"None"}
                                        />
                                    </Col>
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
                                    <FaPencilAlt className="profile-fa-icon" size="2vw" onClick={() => this.editListing(listing)}/>
                                    <FaTrash className="profile-fa-icon" size="2vw" onClick={() => this.removeListing(listing)} />
                            </div>
                        }
                </Modal>
        </Container>
        );
    }

}
