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

const localizer = BigCalendar.momentLocalizer(moment);

interface Props {}

interface State {
  events: any;
  style: any;
  height: any;
  alert: any;
}

export class Calendar extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      events: EventService.getEvents(),
      style: "",
      height: "100vh",
      alert: null
    };
  }

  hideAlert = () => {
    this.setState({
      alert: null
    });
  };

  addNewEventAlert(slotInfo: any) {
    this.setState({
      alert: (
        <SweetAlert
          input
          showCancel
          style={{ display: "block", marginTop: "-100px" }}
          title="Enter Event"
          onConfirm={e => this.addNewEvent(e, slotInfo)}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="info"
          cancelBtnBsStyle="danger"
        />
      )
    });
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

  addNewEvent = (e: any, slotInfo: any) => {
    var newEvents = this.state.events;
    EventService.addEvent(e, slotInfo.start, slotInfo.end);
    this.setState({
      alert: null,
      events: EventService.getEvents()
    });
  };

  /**
   * @override
   */
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
            onSelectSlot={slotInfo => {
              this.addNewEventAlert(slotInfo);
            }}
          />
        </div>
      </div>
    );
  }
}
