import * as React from "react";
import { Component, ReactNode } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Modal,
  Nav,
  ButtonToolbar
} from "react-bootstrap";
import BigCalendar, {
  BigCalendarProps,
  Navigate,
  View,
  DateRange,
  DateLocalizer,
  ToolbarProps,
  EventProps,
  EventWrapperProps
} from "react-big-calendar";
import moment from "moment";
import SweetAlert from "react-bootstrap-sweetalert";
import Datetime from "react-datetime";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./style/Calendar.css";
import "./style/react-datetime.css";

import NavBar from "./NavBar";
import * as EventService from "./services/EventService";
import { getJSON, postJSON, deleteJSON } from "../../util/json";

const localizer = BigCalendar.momentLocalizer(moment);

interface Props {}

// tempEvent is a clone of the selected event for editing
interface State {
  create?: boolean;
  readMode?: boolean;
  title: string;
  description: string;
  start: Date | null;
  end: Date | null;
  userID: number | undefined;

  events: any;
  tempEvent: any;
  style: any;
  height: any;
  alert: any;
}

export class Calendar extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      userID: undefined,
      create: false,
      readMode: false,
      title: "",
      description: "",
      start: null,
      end: null,

      events: [],
      tempEvent: {},
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

  private alertReadMode = (e: any) => {
    const startTime = new Date(e.start).toString().substr(0, 21);
    this.setState({
      alert: (
        <SweetAlert title="Event Details" onConfirm={this.hideAlert}>
          <br />
          Title: {e.title}
          <br />
          Description: {e.description}
          <br />
          Start time: <time>{startTime}</time>
          <br />
          {/* End time: {e.end}  */}
        </SweetAlert>
      )
    });
  };

  private addNewEventAlert(slotInfo: any) {
    this.setState({
      alert: (
        <SweetAlert
          input
          showCancel
          style={{ display: "block", marginTop: "-100px" }}
          title="Enter Event"
          onConfirm={(e: any) => this.addNewEvent(e, slotInfo)}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="info"
          cancelBtnBsStyle="danger"
        />
      )
    });
  }

  private addNewEvent = (e: any, slotInfo: any) => {
    var newEvents = this.state.events;
    EventService.addEvent(e, slotInfo.start, slotInfo.end);
    this.setState({
      alert: null,
      events: EventService.getEvents()
    });
  };

  private setTitle = (e: any) => {
    this.setState({ title: e.target.value });
  };

  private setDescription = (e: any) => {
    this.setState({ description: e.target.value });
  };

  private createEvent = (e: any) => {
    this.setState({ create: true, start: e.start, end: e.end });
  };

  private submitForm = async () => {
    const data = await postJSON("/api/event", {
      title: this.state.title,
      description: this.state.description,
      start: this.state.start,
      end: this.state.end
    });
    this.handleCloseCreate();
    this.getEvents();
  };

  private handleCloseCreate = () => {
    this.setState({
      create: false,
      readMode: false,
      title: "",
      description: "",
      start: null,
      end: null
    });
  };
  private deleteEvent = async () => {
    const buildPath = "/api/event/" + this.state.tempEvent._id.toString();
    const data = await deleteJSON(buildPath);
    const newEvents = this.state.events.filter((e: any) => {
      return e._id != this.state.tempEvent._id;
    });
    this.setState({
      events: newEvents,
      create: false
    });
  };

  private getEvents = async () => {
    const eventsFromDB = await getJSON("/api/events");
    var eventsFormated = [];
    const arrayLength = eventsFromDB.length;
    const colors = ["default", "red", "green", "orange", "azure"];
    for (var i = 0; i < arrayLength; i++) {
      var record = eventsFromDB[i];
      var newEvent = {
        _id: record.id,
        userID: record.userID,
        title: record.title,
        description: record.description,
        start: new Date(record.start),
        end: new Date(record.end),
        allDay: false,
        color: colors[Math.floor(Math.random() * colors.length)]
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
      const cloneEvent = { ...this.state.events[eventIndex] };
      console.log(cloneEvent);
      this.setState({
        tempEvent: cloneEvent,
        create: true
      });
    } else {
      // show event details
      this.alertReadMode(e);
    }
  };

  private eventColors(event: any, start: any, end: any, isSelected: any) {
    var backgroundColor = "rbc-event-";
    event.color
      ? (backgroundColor = backgroundColor + event.color)
      : (backgroundColor = backgroundColor + "default");
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
        {/* Popup for create and delete event */}
        <Modal
          size="lg"
          show={this.state.create}
          onHide={this.handleCloseCreate}
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
                  value={this.state.tempEvent.title}
                  onChange={this.setTitle}
                />
              </Form.Group>
              <div>
                <Row>
                  <Col md={6}>
                    <h6 className="title">Start</h6>
                    <Form.Group>
                      <Datetime
                        inputProps={{ placeholder: "Datetime Picker Here" }}
                        defaultValue={new Date()}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <h6 className="title">End</h6>
                    <Form.Group>
                      <Datetime
                        inputProps={{ placeholder: "Datetime Picker Here" }}
                        defaultValue={new Date()}
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
                  value={this.state.tempEvent.description}
                  onChange={this.setDescription}
                />
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
                &nbsp;&nbsp;
                <Button variant="outline-danger" onClick={this.deleteEvent}>
                  Delete
                </Button>
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
