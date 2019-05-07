import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Card, Button} from "react-bootstrap"


interface Props {
}

interface State {
}

const now = new Date();

const events = [
  {
    id: 0,
    title: 'All Day Event very long title',
    start: new Date(2015, 3, 0),
  },
  {
    id: 1,
    title: 'Long Event',
    start: new Date(2015, 3, 7),
    end: new Date(2015, 3, 10),
  },
  {
    id: 2,
    title: 'DTS STARTS',
    start: new Date(2016, 2, 13, 0, 0, 0),
    end: new Date(2016, 2, 20, 0, 0, 0),
  },
  {
    id: 3,
    title: 'DTS ENDS',
    start: new Date(2016, 10, 6, 0, 0, 0),
    end: new Date(2016, 10, 13, 0, 0, 0),
  },
  {
    id: 4,
    title: 'Some Event',
    start: new Date(2015, 3, 9, 0, 0, 0),
    end: new Date(2015, 3, 10, 0, 0, 0),
  },
  {
    id: 5,
    title: 'Conference',
    description: 'Big conference for important people',
    start: new Date(2015, 3, 11),
    end: new Date(2015, 3, 13),
  },
  {
    id: 6,
    title: 'Meeting',
    description: 'Pre-meeting meeting, to prepare for the meeting',
    start: new Date(2015, 3, 12, 10, 30, 0, 0),
    end: new Date(2015, 3, 12, 12, 30, 0, 0),
  },
  {
    id: 7,
    title: 'Lunch',
    description: 'Power lunch',
    start: new Date(2015, 3, 12, 12, 0, 0, 0),
    end: new Date(2015, 3, 12, 13, 0, 0, 0),
  },
  {
    id: 8,
    title: 'Meeting',
    start: new Date(2015, 3, 12, 14, 0, 0, 0),
    end: new Date(2015, 3, 12, 15, 0, 0, 0),
  },
  {
    id: 9,
    title: 'Happy Hour',
    description: 'Most important meal of the day',
    start: new Date(2015, 3, 12, 17, 0, 0, 0),
    end: new Date(2015, 3, 12, 17, 30, 0, 0),
  },
  {
    id: 10,
    title: 'Dinner',
    start: new Date(2015, 3, 12, 20, 0, 0, 0),
    end: new Date(2015, 3, 12, 21, 0, 0, 0),
  },
  {
    id: 11,
    title: 'Birthday Party',
    start: new Date(2015, 3, 13, 7, 0, 0),
    end: new Date(2015, 3, 13, 10, 30, 0),
  },
  {
    id: 12,
    title: 'Late Night Event',
    start: new Date(2015, 3, 17, 19, 30, 0),
    end: new Date(2015, 3, 18, 2, 0, 0),
  },
  {
    id: 13,
    title: 'Late Same Night Event',
    start: new Date(2015, 3, 17, 19, 30, 0),
    end: new Date(2015, 3, 17, 23, 30, 0),
  },
  {
    id: 14,
    title: 'Multi-day Event',
    start: new Date(2015, 3, 20, 19, 30, 0),
    end: new Date(2015, 3, 22, 2, 0, 0),
  },
  {
    id: 15,
    title: 'Today',
    start: new Date(new Date().setHours(new Date().getHours() - 3)),
    end: new Date(new Date().setHours(new Date().getHours() + 3)),
  },
  {
    id: 16,
    title: 'Point in Time Event',
    start: now,
    end: now,
  },
];

const listings = [
    {
        id: 1,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 2,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 3,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 4,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 5,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 6,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 7,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 8,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 9,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 10,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 11,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 12,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 13,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 14,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 15,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 16,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
    {
        id: 16,
        title: 'Listing Title',
        description: 'Lorem ipsum dolor sit amet, consectetuer',
        type: 'ipsum',
        tags: ['Lorem', 'ipsum', 'dolor'],
        postingDate: new Date(2015, 3, 0),
    },
  ];

/**
 * 
 */
export class HomeContent extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    private readonly createEvents = () => {
        let currentEvents = [];

        for(let i=0; i < events.length; i++)
        {
            currentEvents.push(
                <Card key={i} className="home-content-event-card">
                    <Card.Header className="home-content-event-header">Title: {events[i].id}</Card.Header>
                    <Card.Body>
                        <Card.Title>{events[i].title}</Card.Title>
                        <Card.Text className="home-content-description">
                        <span className="home-content-description">{events[i].start != null? events[i].start.toLocaleDateString(): ""}</span>
                        </Card.Text>
                        <Button variant="light" className="home-content-button">Go to event</Button>
                    </Card.Body>
                </Card>
            );
        }

        return currentEvents;
    };


    private readonly createListings = () => {
        let currentListings = [];

        for(let i=0; i < listings.length; i++)
        {
            currentListings.push(
                <Card key={i} className="home-content-listing-card">
                    <Card.Header className="home-content-listing-header">{listings[i].id}: {listings[i].title}</Card.Header>
                    <Card.Body>
                        <Card.Title>{listings[i].type}</Card.Title>
                        <Card.Text className="home-content-description">
                            DESCRIPTION: {listings[i].description}
                        </Card.Text>
                        <Button variant="light" className="home-content-button">Go to listing</Button>
                    </Card.Body>
                </Card>
            );
        }

        return currentListings;
    };
  
    /**
     * @override
     */
    public render(): ReactNode {

        //let imgWidth = this.state.width;
        //let imgHeight = this.state.height;

        let events = this.createEvents();
        let listings = this.createListings();

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