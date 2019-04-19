import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {CalendarEvent} from "../../entity/CalendarEvent";

export function route(app: Express, db: Connection) {
    app.get("/api/events", async (request: Request, response: Response) => {
        const allEvents: CalendarEvent[] = await CalendarEvent.find();
        response.send(JSON.stringify(allEvents));
    });
}
