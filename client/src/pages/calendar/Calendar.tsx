import * as React from "react";
import {Component, ReactNode} from "react";
import moment = require("moment");
import BigCalendar, {DateLocalizer, View} from "react-big-calendar";
import {CalendarEvent} from "./CalendarEvent";
import {events} from "./events";

import "react-big-calendar/lib/css/react-big-calendar.css";

interface Props {
}

interface State {
    events: CalendarEvent[];
}

const localizer: DateLocalizer = BigCalendar.momentLocalizer(moment);

/**
 * 
 */
export class Calendar extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            events: []
        };
    }

    /**
     * @override
     */
    public render(): ReactNode {
        const views: View[] = Object.values<View>(BigCalendar.Views);
        return (
            <BigCalendar
                localizer={localizer}
                events={events}
                views={views}
                titleAccessor={e => e.title}
                allDayAccessor={e => e.end == null}
                startAccessor={e => e.start}
                endAccessor={e => e.end || e.start}
                step={60}
                showMultiDayTimes
                defaultDate={new Date(2015, 3, 1)}
            />
        );
    }

}
