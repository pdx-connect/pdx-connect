import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Table, Modal, Button} from "react-bootstrap";


interface Props {
    events: Event[];
}

interface State {
    showEditEvent: boolean;
    event: Event | undefined;
}

interface Event {
    deleted: number;
    description: string;
    end: string;
    id: number;
    start: string;
    title: string;
    userID: number;
}




/**
 * 
 */
export class Events extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            showEditEvent: false,
            event: undefined
        };
    }

    private readonly updateEvent = (eventID: number, index: number) => {
        this.setState({
            showEditEvent: true,
            event: this.props.events[index]
        });
    }

    private readonly createEvents = (events: Event[]) => {
        let eventGrid = [];

        for(let i = 0; i < events.length; i++)
        {
            let start = new Date(events[0].start);
            let end = new Date(events[0].end);

            eventGrid.push(
                <tr key={i} onClick={() => this.updateEvent(events[0].id, i)} className="profile-my-events">
                    <td className="profile-my-events-title">{events[0].title}</td>
                    <td className="profile-my-events-description">{events[0].description}</td>
                    <td className="profile-my-events-start">{start.toDateString()}</td>
                    <td className="profile-my-events-start">{end.toDateString()}</td>
                </tr>
            );
        }

        return eventGrid;
    }


    public render(): ReactNode {

        let events = this.createEvents(this.props.events);

        return (
            <Container fluid className="profile-events">
                <Row>
                    <Col sm={12}><h3 className="profile-sub-title mt-1">my events</h3></Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <Table striped responsive="sm" className="profile-my-events-table">
                            <thead className="profile-my-events-table-header">
                                <tr key={1}>
                                    <th>
                                        title
                                    </th>
                                    <th>
                                        description
                                    </th>
                                    <th>
                                        start
                                    </th>
                                    <th>
                                        end
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {events}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                <Modal size="lg" show={this.state.showEditEvent} onHide={() => this.setState({ showEditEvent: false })} dialogClassName="profile-my-events-modal" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Modal title</Modal.Title>
                </Modal.Header>
                    <Modal.Body>
                        {this.state.event != undefined?
                            <div>
                                <span>deleted: {this.state.event.deleted}</span>
                                <span>description: {this.state.event.deleted}</span>
                                <span>end: {this.state.event.description}</span>
                                <span>start: {this.state.event.id}</span>
                                <span>title: {this.state.event.title}</span>
                                <span>userID: {this.state.event.userID}</span>
                            </div>
                            :
                            null
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => this.setState({ showEditEvent: false })}>Close</Button>
                        <Button variant="light">Save changes</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }

}