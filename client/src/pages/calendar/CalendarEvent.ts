/**
 * An object that represents a calendar event.
 */
export interface CalendarEvent {

    /**
     * The unique ID of the calendar event.
     */
    id: number;

    /**
     * The title of the event.
     */
    title: string;

    /**
     * The description of the event.
     * If the description is undefined, then the description is empty.
     */
    description?: string;

    /**
     * The start time/date of the event.
     */
    start: Date;

    /**
     * The end time/date of the event.
     * If the end is undefined, then the event lasts all day.
     */
    end?: Date;

}
