import {Express, Request, Response} from "express";
import {Connection} from "typeorm";

import {CalendarEvents} from "../../entity/CalendarEvents"

export function route(app: Express, db: Connection) {
 
    app.get("/api/events", async (request: Request, response: Response) => {
        const allEvents = await CalendarEvents.find();
        // console.log("all the events: ", allEvents);
        response.send(JSON.stringify({allEvents}));
    });
}
