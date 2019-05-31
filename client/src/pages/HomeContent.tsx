import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Card, Button} from "react-bootstrap"
import {getJSON} from "../util/json";
import { RouteChildrenProps } from 'react-router';


interface Props extends RouteChildrenProps {
}

interface Props {
    userID?: number;
}

interface State {
    listings: ListingEntry[],
    events: EventEntry[],
}

interface ListingEntry {
    id: number,
    title: string,
    description: string,
    type: string,
    tags: string[],
    datePosted: string
}

interface EventEntry {
    id: number,
    title: string,
    description: string,
    start: string,
    end?: string
}

/**
 * 
 */
export class HomeContent extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            events: [],
            listings: []
        };
    }

    private readonly getEvents = () => {
        return getJSON("/api/events/homeContent");
    };

    private readonly getListings = () => {
        return getJSON("/api/listings/homeContent");
    };

    private goToEvent = (eventid: number | undefined) => {
        if(eventid != undefined) {
            this.props.history.push({
                pathname: '/calendar',
                search: '?eventid=' + eventid
            });
        }
    };

    private goToListing = (listingid: number | undefined) => {
        if(listingid != undefined) {
            this.props.history.push({
                pathname: '/listings',
                search: '?listingid=' + listingid
            });
        }
    };

    private readonly createEvents = (events: EventEntry[]) => {
        let currentEvents = [];

        for (let i = 0; i < events.length; i++) {

            let id: number | undefined = events[i].id ? events[i].id : undefined;
            let title  = events[i].title ? events[i].title : "";
            let description = events[i].description ? events[i].description : "";
            let start = events[i].start ? new Date(events[i].start).toString() : "";

            currentEvents.push(
                <Card key={i} className="home-content-event-card">
                    <Card.Header className="home-content-event-header">{title}</Card.Header>
                    <Card.Body>
                        <Card.Title>{start}</Card.Title>
                        <Card.Text className="home-content-description">
                            {description}
                        </Card.Text>
                        <Button variant="light" className="home-content-button"
                                onClick={() => this.goToEvent(id)}>Go to event</Button>
                    </Card.Body>
                </Card>
            );
        }

        return currentEvents;
    };
    
    private readonly createListings = (listings: ListingEntry[]) => {
        let currentListings = [];

        for (let i = 0; i < listings.length; i++) {
            let id: number | undefined = listings[i].id ? listings[i].id : undefined;
            let tags = listings[i].tags.length != 0 ? listings[i].tags.toString() : "";
            let title = listings[i].title ? listings[i].title : "";
            let description = listings[i].description ? listings[i].description : "";
            let type = listings[i].type ? listings[i].type : "";
            let date = listings[i].datePosted ? new Date(listings[i].datePosted).toString() : "";

            currentListings.push(
                <Card key={i} className="home-content-listing-card">
                    <Card.Header className="home-content-listing-header">{title}</Card.Header>
                    <Card.Body>
                        <Card.Title>{date}</Card.Title>
                        <Card.Title>{tags}</Card.Title>
                        <Card.Text className="home-content-description">
                            {description}
                        </Card.Text>
                        <Button variant="light" className="home-content-button"
                                onClick={() => this.goToListing(id)}>Go to listing</Button>
                    </Card.Body>
                </Card>
            );
        }

        return currentListings;
    };

    /**
     * @override
     */
    public async componentDidMount() {
        
        const [eventData, listingData] = await Promise.all([
            this.getEvents(),
            this.getListings()
        ]);

        //TEST
        /*
        console.log("Data read from server");
        console.log("events: ", eventData);
        console.log("listings: ", listingData);
        */

        this.setState({
            listings: listingData,
            events: eventData
        });
    }
    
    /**
     * @override
     */
    public render(): ReactNode {

        let events = this.createEvents(this.state.events);
        let listings = this.createListings(this.state.listings);

        return (
            <Container fluid className="home-content">
                <Row className="home-content-sub-title">
                    <Col>events</Col>
                    <Col>listings</Col>
                </Row>

                <Row>
                    <Col sm={6} className="home-content-cards">
                        {events.length === 0?
                                <Card className="home-content-event-card">
                                    <Card.Header className="home-content-event-header">No Events</Card.Header>
                                    <Card.Body>
                                        <Card.Title></Card.Title>
                                        <Card.Text className="home-content-description">
                                        </Card.Text>
                                        <Button variant="light" className="home-content-button"></Button>
                                    </Card.Body>
                                </Card>
                             :
                             events}
                    </Col>

                    <Col sm={6} className="home-content-cards">
                        {listings.length === 0?
                            <Card className="home-content-listing-card">
                                <Card.Header className="home-content-listing-header">No Listings</Card.Header>
                                <Card.Body>
                                    <Card.Title></Card.Title>
                                    <Card.Title></Card.Title>
                                    <Card.Text className="home-content-description">
                                    </Card.Text>
                                    <Button variant="light" className="home-content-button"></Button>
                                </Card.Body>
                            </Card>
                            :
                            listings }
                    </Col>
                </Row>
            </Container>
        );
    }

}
