import * as React from "react";
import {Component, ReactNode} from "react";
import {Row, Col, Form, Button, Modal, ButtonToolbar} from "react-bootstrap";
import BigCalendar from "react-big-calendar";
import moment from "moment";
import SweetAlert from "react-bootstrap-sweetalert";
import Datetime from "react-datetime";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./style/Calendar.css";
import "./style/react-datetime.css";

import * as EventService from "./services/EventService";
import {getJSON, postJSON, deleteJSON, updateJSON} from "../../util/json";

const localizer = BigCalendar.momentLocalizer(moment);

interface Props {
}

// tempEvent is a clone of the selected event for editing
interface State {
    create?: boolean;
    edit?: boolean;
    readMode?: boolean;
    title: string;
    description: string;
    start: Date;
    end: Date;
    userID: number | undefined;
    _id: number | undefined;

    events: any;
    tempEvent: any;
    errors: any;
    style: any;
    height: any;
    alert: any;
}

export class Calendar extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            userID: undefined,
            _id: undefined,
            create: false,
            edit: false,
            readMode: false,
            title: "",
            description: "",
            start: new Date(),
            end: new Date(),

            events: [],
            tempEvent: {},
            errors: {},
            style: "",
            height: "100vh",
            alert: null
        };
    }

    private hideAlert = () => {
        this.setState({
            alert: null
        });
    };

    private submitAttending = async (eventID: any) => {
        const buildPath = "/api/event/attend/" + eventID.toString();
        const dummyObj = {};
        await postJSON(buildPath, dummyObj);
        this.hideAlert();
        return this.getEvents();
    };

    private alertReadMode = (e: any) => {
        const startTime = new Date(e.start).toString().substr(0, 21);
        const endTime = new Date(e.start).toString().substr(0, 21);
        const eventID = e._id;
        this.setState({
            alert: (
                <SweetAlert title="Event Details"
                            showCancel
                            confirmBtnText="Attending"
                            cancelBtnText="Not attending"
                            onConfirm={() => this.submitAttending(eventID)}
                            onCancel={this.hideAlert}
                            confirmBtnBsStyle="success"
                >
                    <br/>
                    Title: {e.title}
                    <br/>
                    Description: {e.description}
                    <br/>
                    Start time: <time>{startTime}</time>
                    <br/>
                    End time: {endTime}
                    <br/>
                    <strong>Attending:</strong> {e.attending}
                </SweetAlert>
            )
        });
    };

    private addNewEventAlert(slotInfo: any) {
        this.setState({
            alert: <SweetAlert
                input
                showCancel
                style={{display: "block", marginTop: "-100px"}}
                title="Enter Event"
                onConfirm={(e: any) => this.addNewEvent(e, slotInfo)}
                onCancel={() => this.hideAlert()}
                confirmBtnBsStyle="info"
                cancelBtnBsStyle="danger"
            />
        });
    }

    private addNewEvent = (e: any, slotInfo: any) => {
        EventService.addEvent(e, slotInfo.start, slotInfo.end);
        this.setState({
            alert: null,
            events: EventService.getEvents()
        });
    };

    private setTitle = (e: any) => {
        this.setState({title: e.target.value});
    };

    private setDescription = (e: any) => {
        this.setState({description: e.target.value});
    };

    private setStartTime = (e: any) => {
        this.setState({start: e._d});
    };
    private setEndTime = (e: any) => {
        this.setState({end: e._d});
    };

    private createEvent = (e: any) => {
        this.setState({create: true, start: e.start, end: e.end});
    };

    private validate = () => {
        const errors: any = {};
        const {title} = this.state;
        if (title.trim() === "") errors.title = "Title is required.";
        const {description} = this.state;
        if (description.trim() === "")
            errors.description = "Description is required.";

        return Object.keys(errors).length === 0 ? {} : errors;
    };

    private submitForm = async () => {
        const errors = this.validate();
        // TODO add div to handle error from data
        if (Object.keys(errors).length === 0) {
            this.setState({errors: {}});
            await postJSON("/api/event", {
                title: this.state.title,
                description: this.state.description,
                start: this.state.start,
                end: this.state.end
            });
            this.handleCloseCreate();
            return this.getEvents();
        } else {
            this.setState({
                errors: errors
            });
        }
    };

    private submitChanges = async () => {
        const eventIndex = this.state.events.findIndex(
            (an_event: any) => an_event._id === this.state._id
        );
        const cloneEvent = {...this.state.events[eventIndex]};
        const {title, description, start, end} = this.state;
        if (
            cloneEvent.title !== title ||
            cloneEvent.description !== description ||
            cloneEvent.start !== start ||
            cloneEvent.end !== end
        ) {
            const errors = this.validate();
            // TODO add div to handle error from data
            if (Object.keys(errors).length === 0) {
                this.setState({errors: {}});
                const buildPath = "/api/event/" + cloneEvent._id.toString();
                const data = await updateJSON(buildPath, {
                    title: title,
                    description: description,
                    start: start,
                    end: end
                });
                this.handleCloseCreate();
                this.getEvents();
            } else {
                this.setState({errors: errors});
            }
        }
    };

    private handleCloseCreate = () => {
        this.setState({
            create: false,
            readMode: false,
            edit: false,
            title: "",
            description: "",
            start: new Date(),
            end: new Date(),
            errors: {}
        });
    };
    private deleteEvent = async () => {
        if (this.state._id !== undefined) {
            const buildPath = "/api/event/" + this.state._id.toString();
            await deleteJSON(buildPath);
            const newEvents = this.state.events.filter((e: any) => {
                return e._id != this.state._id;
            });
            this.setState({
                events: newEvents
            });
            this.handleCloseCreate();
        }
    };

    private getEvents = async () => {
        const eventsFromDB = await getJSON("/api/events");
        const eventsFormated = [];
        const arrayLength = eventsFromDB.length;
        const colors = ["default", "red", "green", "orange", "azure"];
        for (let i = 0; i < arrayLength; i++) {
            const record = eventsFromDB[i];
            const newEvent = {
                _id: record.id,
                userID: record.userID,
                title: record.title,
                description: record.description,
                start: new Date(record.start),
                end: new Date(record.end),
                allDay: false,
                color: colors[Math.floor(Math.random() * colors.length)],
                attending: record.attending
            };
            eventsFormated.push(newEvent);
        }
        this.setState({
            events: eventsFormated
        });
    };

    private selectedEvent = (e: any) => {
        const userID = this.state.userID;
        // popup for event owner -- read and edit mode
        if (e.userID == userID) {
            const eventIndex = this.state.events.findIndex(
                (an_event: any) => an_event._id === e._id
            );
            const cloneEvent = {...this.state.events[eventIndex]};
            this.setState({
                _id: cloneEvent._id,
                title: cloneEvent.title,
                description: cloneEvent.description,
                start: cloneEvent.start,
                end: cloneEvent.end,
                edit: true
            });
        } else {
            // show event details
            this.alertReadMode(e);
        }
    };

    private eventColors(event: any, start: any, end: any, isSelected: any) {
        let backgroundColor = "rbc-event-";
        if (event.color) {
            backgroundColor += event.color;
        } else {
            backgroundColor += "default";
        }
        return {
            className: backgroundColor
        };
    }

    private readonly getUserID = async () => {
        const data = await getJSON("/api/user/name");
        this.setState({
            userID: data.userID
        });
    };

    public componentDidMount() {
        this.getEvents().then();
        this.getUserID().then();
    }

    public render(): ReactNode {
        return (
            <div className="main-content">
                {/* <NavBar />   */}
                <div className="rbc-calendar">
                    {this.state.alert}
                    <BigCalendar
                        selectable
                        localizer={localizer}
                        events={this.state.events}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectEvent={event => this.selectedEvent(event)}
                        eventPropGetter={this.eventColors}
                        onSelectSlot={slotInfo => {
                            this.createEvent(slotInfo);
                        }}
                    />
                </div>
                {/* Modal for creating Event*/}
                <Modal
                    size="lg"
                    show={this.state.create}
                    onHide={this.handleCloseCreate}
                    backdrop="static"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Create Event</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group>
                                <h6 className="title">Title</h6>
                                <Form.Control
                                    type="text"
                                    value={this.state.title}
                                    onChange={this.setTitle}
                                />
                                {this.state.errors.title && (
                                    <div className="alert alert-danger">
                                        {this.state.errors.title}
                                    </div>
                                )}
                            </Form.Group>
                            <div>
                                <Row>
                                    <Col md={6}>
                                        <h6 className="title">Start</h6>
                                        <Form.Group>
                                            <Datetime
                                                inputProps={{placeholder: "Datetime Picker Here"}}
                                                defaultValue={this.state.start}
                                                onChange={this.setStartTime}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <h6 className="title">End</h6>
                                        <Form.Group>
                                            <Datetime
                                                inputProps={{placeholder: "Datetime Picker Here"}}
                                                defaultValue={this.state.end}
                                                onChange={this.setEndTime}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                            <Form.Group>
                                <h6 className="title">Description</h6>
                                <Form.Control
                                    as="textarea"
                                    rows="3"
                                    value={this.state.description}
                                    onChange={this.setDescription}
                                />
                                {this.state.errors.description && (
                                    <div className="alert alert-danger">
                                        {this.state.errors.description}
                                    </div>
                                )}
                            </Form.Group>
                            {/* <Form.Group>
                <Form.Label>Tags</Form.Label>
                <Select
                  options={this.state.optionTags}
                  value={this.state.selectedTags}
                  onChange={this.handleTagChange}
                  isMulti={true}
                />
              </Form.Group> */}
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Form>
                            <ButtonToolbar>
                                <Button variant="outline-primary" onClick={this.submitForm}>
                                    Submit
                                </Button>
                            </ButtonToolbar>
                        </Form>
                    </Modal.Footer>
                </Modal>
                {/* *************************************************** */}
                {/* Modal for editing Event */}
                <Modal
                    size="lg"
                    show={this.state.edit}
                    onHide={this.handleCloseCreate}
                    backdrop="static"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Event</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group>
                                <h6 className="title">Title</h6>
                                <Form.Control
                                    type="text"
                                    value={this.state.title}
                                    onChange={this.setTitle}
                                />
                                {this.state.errors.title && (
                                    <div className="alert alert-danger">
                                        {this.state.errors.title}
                                    </div>
                                )}
                            </Form.Group>
                            <div>
                                <Row>
                                    <Col md={6}>
                                        <h6 className="title">Start</h6>
                                        <Form.Group>
                                            <Datetime
                                                inputProps={{placeholder: "Datetime Picker Here"}}
                                                defaultValue={this.state.start}
                                                onChange={this.setStartTime}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <h6 className="title">End</h6>
                                        <Form.Group>
                                            <Datetime
                                                inputProps={{placeholder: "Datetime Picker Here"}}
                                                defaultValue={this.state.end}
                                                onChange={this.setEndTime}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                            <Form.Group>
                                <h6 className="title">Description</h6>
                                <Form.Control
                                    as="textarea"
                                    rows="3"
                                    value={this.state.description}
                                    onChange={this.setDescription}
                                />
                                {this.state.errors.description && (
                                    <div className="alert alert-danger">
                                        {this.state.errors.description}
                                    </div>
                                )}
                            </Form.Group>
                            {/* <Form.Group>
                <Form.Label>Tags</Form.Label>
                <Select
                  options={this.state.optionTags}
                  value={this.state.selectedTags}
                  onChange={this.handleTagChange}
                  isMulti={true}
                />
              </Form.Group> */}
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Form>
                            <ButtonToolbar>
                                <Button variant="outline-primary" onClick={this.submitChanges}>
                                    Submit Changes
                                </Button>
                                &nbsp;&nbsp;
                                {/* conditional rendering */}
                                {this.state.edit && (
                                    <Button variant="outline-danger" onClick={this.deleteEvent}>
                                        Delete
                                    </Button>
                                )}
                            </ButtonToolbar>
                        </Form>
                    </Modal.Footer>
                </Modal>

                {/* Popup for displaying event details */}
                <Modal show={this.state.readMode} onHide={this.handleCloseCreate}>
                    <Modal.Header closeButton>
                        <Modal.Title>Event Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ul>
                            <li>Title: {this.state.title}</li>
                            <li>Description: {this.state.description}</li>
                        </ul>
                    </Modal.Body>
                    <Modal.Footer>
                        <Form>
                            <Form.Group>
                                <Button
                                    size="sm"
                                    variant="info"
                                    onClick={this.handleCloseCreate}
                                >
                                    Close
                                </Button>
                            </Form.Group>
                        </Form>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

//   addNewEventAlert = (slotInfo: any) => {
//     const getAlert = () => (
//         <SweetAlert
//         warning
//         showCancel
//         confirmBtnText="Yes!"
//         confirmBtnBsStyle="danger"
//         cancelBtnBsStyle="default"
//         title="Are you sure you want to delete this project?"
//         onConfirm={() => this.deleteFile()}
//         // onCancel={() => this.onCancelDelete()}
//         >
//         You will not be able to recover this project!
//     </SweetAlert>)
//     this.setState({
//         alert: getAlert()
//     });
// this.setState({
//     alert: ( <
//         SweetAlert success title = "Woot!"
//         onConfirm = {
//             () => this.hideAlert()
//         } >
//         Hello world!
//         </SweetAlert>
//     )
//     // });
//   };
