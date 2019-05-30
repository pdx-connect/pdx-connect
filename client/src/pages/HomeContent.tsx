import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Card, Button} from "react-bootstrap"
import {getJSON} from "../util/json";
import { RouteChildrenProps } from 'react-router';


interface Props extends RouteChildrenProps {
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

const now = new Date();

const events: EventEntry[] = [
    {
        id: 0,
        title: "event 1",
        description: "description of something 1",
        start: "October 13, 2014 11:13:00",
        end: "October 13, 2014 11:13:00"
    },
    {
        id: 1,
        title: "event 2",
        description: "description of something 2",
        start: "October 13, 2014 11:13:00",
    }
];

const listings: ListingEntry[] = [
    {
        id: 0,
        title: "listing 1",
        description: "description of something 1",
        type: "something",
        tags: ['a', 'b', 'c', 'd'],
        datePosted: "October 13, 2014 11:13:00"
    },
    {
        id: 1,
        title: "listing 2",
        description: "description of something 2",
        type: "something",
        tags: ['a', 'b', 'c'],
        datePosted: "October 13, 2014 11:13:00"
    },
];

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

    private goToEvent = (eventid: number) => {
        this.props.history.push({
            pathname: '/calendar',
            search: '?eventid=' + eventid
        });
    };

    private goToListing = (listingid: number) => {
        this.props.history.push({
            pathname: '/listings',
            search: '?listingid=' + listingid
        });
    };

    private readonly createEvents = () => {
        let currentEvents = [];

        for (let i = 0; i < events.length; i++) {
            let start = new Date(events[i].start);

            currentEvents.push(
                <Card key={i} className="home-content-event-card">
                    <Card.Header className="home-content-event-header">{events[i].title}</Card.Header>
                    <Card.Body>
                        <Card.Title>{start.toString()}</Card.Title>
                        <Card.Text className="home-content-description">
                            {events[i].description}
                        </Card.Text>
                        <Button variant="light" className="home-content-button"
                                onClick={() => this.goToEvent(events[i].id)}>Go to event</Button>
                    </Card.Body>
                </Card>
            );
        }

        return currentEvents;
    };
    
    private readonly createListings = () => {
        let currentListings = [];

        for (let i = 0; i < listings.length; i++) {
            let date = new Date(listings[i].datePosted);
            let tags = listings[i].tags.toString();

            currentListings.push(
                <Card key={i} className="home-content-listing-card">
                    <Card.Header className="home-content-listing-header">{listings[i].title}</Card.Header>
                    <Card.Body>
                        <Card.Title>{date.toString()}</Card.Title>
                        <Card.Title>{tags}</Card.Title>
                        <Card.Text className="home-content-description">
                            {listings[i].description}
                        </Card.Text>
                        <Button variant="light" className="home-content-button"
                                onClick={() => this.goToListing(listings[i].id)}>Go to listing</Button>
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

        this.setState({
            listings: listingData,
            events: eventData
        });
    }
    
    /**
     * @override
     */
    public render(): ReactNode {

        let events = this.createEvents();
        let listings = this.createListings();

        console.log('event data: ', this.state.events);
        console.log('listing data: ', this.state.listings);

        return (
            <Container fluid className="home-content">
                <Row className="home-content-sub-title">
                    <Col>events</Col>
                    <Col>listings</Col>
                </Row>

                <Row>
                    <Col sm={6} className="home-content-cards">
                        {events}
                    </Col>

                    <Col sm={6} className="home-content-cards">
                        {listings}
                    </Col>
                </Row>
            </Container>
        );
    }

}
