import * as React from "react";
import { Component, ReactNode } from "react";
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
import "./Calendar.css";
// import { any } from 'prop-types';
const localizer = BigCalendar.momentLocalizer(moment);

interface Props {}

interface State {
  events: any;
  style: any;
  height: any;
  alert: any;
}
var today = new Date();
var y = today.getFullYear();
var m = today.getMonth();
var d = today.getDate();

declare const allViews: View[];

const events = [
  {
    title: "All Day Event",
    allDay: true,
    start: new Date(y, m, 1),
    end: new Date(y, m, 1),
    color: "default"
  },
  {
    title: "Meeting",
    start: new Date(y, m, d - 1, 10, 30),
    end: new Date(y, m, d - 1, 11, 30),
    allDay: false,
    color: "green"
  },
  {
    title: "Lunch",
    start: new Date(y, m, d + 7, 12, 0),
    end: new Date(y, m, d + 7, 14, 0),
    allDay: false,
    color: "red"
  },
  {
    title: "Nud-pro Launch",
    start: new Date(y, m, d - 2),
    end: new Date(y, m, d - 2),
    allDay: true,
    color: "azure"
  },
  {
    title: "Birthday Party",
    start: new Date(y, m, d + 1, 19, 0),
    end: new Date(y, m, d + 1, 22, 30),
    allDay: false,
    color: "azure"
  },
  {
    title: "Team C meeting",
    start: new Date(y, m, 21),
    end: new Date(y, m, 22),
    color: "orange"
  },
  {
    title: "Click for Google",
    start: new Date(y, m, 21),
    end: new Date(y, m, 22),
    color: "orange"
  }
];

export class Calendar extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      events: events,
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

  alertCustom() {
    <SweetAlert title="Here's a message!" onConfirm={this.hideAlert} />;
  }

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
    newEvents.push({
      title: e,
      start: slotInfo.start,
      end: slotInfo.end
    });
    this.setState({
      alert: null,
      events: newEvents
    });
  };

  /**
   * @override
   */
  public render(): ReactNode {
    return (
      <div className="rbc-calendar">
        {this.state.alert}
        <BigCalendar
          selectable
          localizer={localizer}
          events={this.state.events}
          startAccessor="start"
          endAccessor="end"
          //   onSelectSlot={slotInfo => this.addNewEventAlert(slotInfo)}
          onSelectSlot={slotInfo => {
            const start = slotInfo.start;
            const end = slotInfo.end;
            const slots = slotInfo.slots;
            console.log(start, end, slots);
            this.addNewEventAlert(slotInfo);
            // this.alertCustom();
          }}
        />
      </div>
    );
  }
}

{
  /* <BigCalendar
          events={this.state.events}
          views={allViews}
          step={60}
          showMultiDayTimes
          defaultDate={new Date(2015, 3, 1)}
          localizer={localizer}
        /> */
}
