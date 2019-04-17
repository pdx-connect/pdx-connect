import * as React from "react";
import {Component, ReactNode} from "react";
import BigCalendar from 'react-big-calendar'
import {TEvent} from "../../components/types";
import events from './events'
import dates from './dates'

interface Props {
}

interface State {
  allViews: TEvent[];
}

/**
 * 
 */
export class Calendar extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
          allViews: []
        };
    }
    
    /**
     * @override
     */
    public render(): ReactNode {
        
      const allViews: TEvent[] = Object.keys(BigCalendar.Views).map(k => BigCalendar.Views[k]);

        let Basic = ({ localizer }) => (
            <BigCalendar
              events={events}
              views={allViews}
              step={60}
              showMultiDayTimes
              max={dates.add(dates.endOf(new Date(2015, 17, 1), 'day'), -1, 'hours')}
              defaultDate={new Date(2015, 3, 1)}
              localizer={localizer}
            />
          )
        
        return (
                <pre>This is the calendar page</pre>
        );
    }

}