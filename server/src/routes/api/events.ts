import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {CalendarEvent} from "../../entity/CalendarEvent";

export function route(app: Express, db: Connection) {
    app.get("/api/events", async (request: Request, response: Response) => {
        if (request.isAuthenticated()) {
            const allEvents: CalendarEvent[] = await CalendarEvent.find();
            response.send(JSON.stringify(allEvents.map(e => {
                return {
                    id: e.id,
                    title: e.title,
                    description: e.description,
                    start: e.start,
                    end: e.end
                };
            })));
        } else {
            response.send(JSON.stringify("Not logged in."));
        }
    });
    app.get("/api/event", async (request: Request, response: Response) => {
        // TODO Get information about a single event by ID
    });
    app.post("/api/event", async (request: Request, response: Response) => {
        // TODO Create a new event or edit an existing one (if event ID is provided)
    });
    app.get("/api/event/tags", async (request: Request, response: Response) => {
        // TODO Get all tags for a single event by ID
    });
    app.post("/api/event/tags", async (request: Request, response: Response) => {
        // TODO Set the tags for a single event
    });
    app.get("/api/event/comments", async (request: Request, response: Response) => {
        // TODO Get all comments for a single event by ID
    });
    app.post("/api/event/comment", async (request: Request, response: Response) => {
        // TODO Create a new comment for an event
    });
}
