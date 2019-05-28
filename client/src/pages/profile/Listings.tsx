import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Table, Modal, Button} from "react-bootstrap";

interface Props {
    listings: Listing[];
}

interface State {
    showEditListing: boolean;
    listing: Listing | undefined;
}

interface Listing {
    anonymous: boolean;
    deleted: boolean;
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
                    <Modal.Title>Modal title</Modal.Title>
                </Modal.Header>
                    <Modal.Body>
                        {this.state.listing != undefined?
                            <div>
                                <span>anonymous: {this.state.listing.anonymous}</span>
                                <span>deleted: {this.state.listing.deleted}</span>
                                <span>description: {this.state.listing.description}</span>
                                <span>id: {this.state.listing.id}</span>
                                <span>timePosted: {this.state.listing.timePosted}</span>
                                <span>title: {this.state.listing.title}</span>
                                <span>userID: {this.state.listing.userID}</span>
                            </div>
                            :
                            null
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => this.setState({ showEditListing: false })}>Close</Button>
                        <Button variant="light">Save changes</Button>
                    </Modal.Footer>
                </Modal>
        </Container>
        );
    }

}
