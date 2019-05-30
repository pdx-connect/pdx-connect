import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Table, Modal, Button} from "react-bootstrap";
import {FaPencilAlt, FaTrash} from "react-icons/fa";
import Select from 'react-select';
import {OptionType} from "../../components/types";
import {postJSON, deleteJSON} from "../../util/json";
import { RouteChildrenProps } from 'react-router';

interface Props extends RouteChildrenProps{
}


interface Props {
    events: Event[];
    updateUserProfile: () => void;
}

interface State {
    showEventView: boolean;
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

interface Tag {
    id: number;
    name: string;
}

/**
 * 
 */
export class Events extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            showEventView: false,
            event: undefined
        };
    }

    private editEvent = (event: Event | undefined) => {
        if(event!= undefined) {
            this.props.history.push({
                pathname: '/calendar',
                search: '?eventid=' + event.id
            });
         } else {
             this.setState({
                 showEventView: false
             });
        }
    }

    private readonly viewEvent = (listingID: number, index: number) => {
        this.setState({
            event: this.props.events[index],
            showEventView: true,
        })
    }

    private readonly removeEvent = (event: Event | undefined) => {
       if(event!= undefined) {
           this.deleteEvent(event.id);
        } else {
            this.setState({
                showEventView: false
            });
        }
    }

    private deleteEvent = async (eventID: number) => {
          const buildPath = "/api/event/" + eventID.toString();
          const data = await deleteJSON(buildPath);

          console.log('data: ', data);
          if(data.success) {
            this.props.updateUserProfile();
            this.setState({
                showEventView: false
            });
        }
    }

    private readonly createEvents = (events: Event[]) => {
        let eventGrid = [];

        for(let i = 0; i < events.length; i++)
        {
            let start = new Date(events[i].start);
            let end = new Date(events[i].end);

            eventGrid.push(
                <tr key={i} onClick={() => this.viewEvent(events[i].id, i)} className="profile-my-events">
                    <td className="profile-my-events-title">{events[i].title}</td>
                    <td className="profile-my-events-description">{events[i].description}</td>
                    <td className="profile-my-events-start">{start.toDateString()}</td>
                    <td className="profile-my-events-start">{end.toDateString()}</td>
                </tr>
            );
        }

        return eventGrid;
    }


    public render(): ReactNode {

        let events = this.createEvents(this.props.events);
        let event = this.state.event;
        
        let hideEditButtons = true;
        let start = "";
        let end = "";
        let tags: OptionType[] = [];


        if(event != undefined) {
            hideEditButtons= event.deleted === 1? true: false;
            start = new Date(event.start).toDateString();
            end = new Date(event.end).toDateString();

            /*tags = event.tags.map((t: { id: number; name: string; }) => {
                let option: OptionType = {
                    value: t.id.toString(),
                    label: t.name
                };
                return option;
            });
            */
        }

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
                <Modal size="lg" show={this.state.showEventView} onHide={() => this.setState({ showEventView: false })} dialogClassName="profile-my-events-modal" backdrop="static">
                <Modal.Header closeButton>
                    <div className="profile-modal-header">
                        <span className="profile-modal-title">my event</span>
                        <span className="profile-modal-sub-title">{event != undefined? event.title : "My Event"}</span>
                    </div>
                </Modal.Header>
                    <Modal.Body>
                        {event != undefined?
                            <Container fluid>
                                <Row className="pb-3">
                                    <Col sm={4} className="profile-label">description</Col>
                                    <Col sm={8} className="profile-listing-content">{event.description}</Col>
                                </Row>
                                <Row className="pb-3">
                                    <Col sm={4} className="profile-label">start</Col>
                                    <Col sm={8} className="profile-listing-content">{start}</Col>
                                </Row>
                                <Row className="pb-3">
                                    <Col sm={4} className="profile-label">end</Col>
                                    <Col sm={8} className="profile-listing-content">{end}</Col>
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
                    <Modal.Footer>
                        {hideEditButtons === true?
                            <div className="profile-modal-footer text-center"><span className="profile-modal-footer-content-center">this event was deleted and cannot be edited</span></div>
                            :
                            <div className="profile-modal-footer">
                                    <FaPencilAlt className="profile-fa-icon" size="2vw" onClick={() => this.editEvent(event)}/>
                                    <FaTrash className="profile-fa-icon" size="2vw" onClick={() => this.removeEvent(event)} />
                            </div>
                        }
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }

}