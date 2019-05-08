import * as React from "react";
import { Component, ReactNode } from "react";
import { Container, Row, Col, Form, Button, Modal, Nav } from "react-bootstrap";
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

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./style/Calendar.css";

import NavBar from "./NavBar";
import * as EventService from "./services/EventService";
import { getJSON, postJSON } from "../../util/json";

const localizer = BigCalendar.momentLocalizer(moment);

interface Props {}
// events = list of all the events
interface State {
  create?: boolean;
  title: string;
  description: string;
  start: Date | null;
  end: Date | null;

  events: any;
  style: any;
  height: any;
  alert: any;
}

export class Calendar extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      create: false,
      title: "",
      description: "",
      start: null,
      end: null,

      events: [],
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
    console.log(this.state.start, this.state.end);
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
      title: "",
      description: "",
      start: null,
      end: null
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
    this.setState({
      title: e.title,
      description: e.description,
      create: true
    });
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

  public componentDidMount() {
    this.getEvents().then();
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
        <Modal show={this.state.create} onHide={this.handleCloseCreate}>
          <Modal.Header closeButton>
            <Modal.Title>Create Event</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={this.state.title}
                  onChange={this.setTitle}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows="3"
                  value={this.state.description}
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
              <Form.Group>
                <Button size="sm" variant="primary" onClick={this.submitForm}>
                  Submit
                </Button>
              </Form.Group>
            </Form>
          </Modal.Footer>
        </Modal>
                {/* Popup for create and delete event */}
        <Modal show={this.state.create} onHide={this.handleCloseCreate}>
          <Modal.Header closeButton>
            <Modal.Title>Create Event</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={this.state.title}
                  onChange={this.setTitle}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows="3"
                  value={this.state.description}
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
              <Form.Group>
                <Button size="sm" variant="primary" onClick={this.submitForm}>
                  Submit
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
