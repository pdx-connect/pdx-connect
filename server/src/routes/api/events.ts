import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {CalendarEvent} from "../../entity/CalendarEvent";
import {Tag} from "../../entity/Tag";
import {CalendarEventComment} from "../../entity/CalendarEventComment";
import {User} from "../../entity/User"

async function parseEventByID(request: Request): Promise<CalendarEvent|null|undefined> {
    const id: number = Number.parseInt(request.params.id);
    if (Number.isNaN(id)) {
        return void 0;
    }
    const event: CalendarEvent|undefined = await CalendarEvent.findOne({
        where: {
            id: id
        }
    });
    if (event == null) {
        return null;
    }
    return event;
}

export function route(app: Express, db: Connection) {
    app.get("/api/events", async (request: Request, response: Response) => {
        if (!request.isAuthenticated()) {
            response.send(JSON.stringify("Not logged in."));
            return;
        }
        const allEvents: CalendarEvent[] = await CalendarEvent.find();
        response.send(JSON.stringify(allEvents.map(e => {
            return {
                id: e.id,
                userID: e.userID,
                title: e.title,
                description: e.description,
                start: e.start,
                end: e.end
            };
        })));
    });
    app.post("/api/event", async (request: Request, response: Response) => {
        if (!request.isAuthenticated()) {
            response.send(JSON.stringify("Not logged in."));
            return;
        }
        // TODO Create a new event
    });
    app.get("/api/event/:id", async (request: Request, response: Response) => {
        if (!request.isAuthenticated()) {
            response.send(JSON.stringify("Not logged in."));
            return;
        }
        const event: CalendarEvent|null|undefined = await parseEventByID(request);
        if (event === void 0) {
            response.sendStatus(400);
        } else if (event === null) {
            response.send(JSON.stringify("Event not found."));
        } else {
            response.send(JSON.stringify({
                userID: event.userID,
                title: event.title,
                description: event.description,
                start: event.start,
                end: event.end
            }));
        }
    });
    app.post("/api/event/:id", async (request: Request, response: Response) => {
        if (!request.isAuthenticated()) {
            response.send(JSON.stringify("Not logged in."));
            return;
        }
        const event: CalendarEvent|null|undefined = await parseEventByID(request);
        if (event === void 0) {
            response.sendStatus(400);
        } else if (event === null) {
            response.send(JSON.stringify("Event not found."));
        } else {
            // TODO Edit an existing event
        }
    });
    app.get("/api/event/:id/tags", async (request: Request, response: Response) => {
        if (!request.isAuthenticated()) {
            response.send(JSON.stringify("Not logged in."));
            return;
        }
        const event: CalendarEvent|null|undefined = await parseEventByID(request);
        if (event === void 0) {
            response.sendStatus(400);
        } else if (event === null) {
            response.send(JSON.stringify("Event not found."));
        } else {
            const tags: Tag[] = await event.tags;
            response.send(JSON.stringify(tags.map(t => {
                return {
                    id: t.id,
                    name: t.name
                };
            })));
        }
    });
    app.post("/api/event/:id/tags", async (request: Request, response: Response) => {
        // TODO Set the tags for a single event 
    });
    app.get("/api/event/:id/comments", async (request: Request, response: Response) => {
        if (!request.isAuthenticated()) {
            response.send(JSON.stringify("Not logged in."));
            return;
        }
        const event: CalendarEvent|null|undefined = await parseEventByID(request);
        if (event === void 0) {
            response.sendStatus(400);
        } else if (event === null) {
            response.send(JSON.stringify("Event not found."));
        } else {
            const comments: CalendarEventComment[] = await event.comments;
            response.send(JSON.stringify(comments.map(c => {
                return {
                    id: c.id,
                    userID: c.userID,
                    timePosted: c.timePosted,
                    content: c.content
                };
            })));
        }
    });
    app.post("/api/event/:id/comment", async (request: Request, response: Response) => {
        console.log("Recieved comment attempt");
        // Get the body of the message, validate formate
        const body: {
            content: string
        } = request.body;
        if (body == null) {
            console.error("Body not valid: ", body);
            response.send(JSON.stringify("Recieved comment request with no body"));
            return;
        }
        // Get the comment body
        const content: string|undefined = body.content;
        if (content == null) {
            console.error("Recieved comment request with no content: ", body);
            response.send(JSON.stringify("No comment provided"));
            return;
        }
        console.log("Got body");
        // Get the userID to ensure that they are logged in
        const user: User|undefined = await User.findOne({
            where: {
                id: request.user.id
            }
        });
        if (user == null) {
            response.send(JSON.stringify("Not logged in."));
            return;
        }
        console.log("Found user");
        // Retrieve the calendar event, verify that it was found
        const event: CalendarEvent|null|undefined = await parseEventByID(request);
        if (event === void 0) {
            response.sendStatus(400);
        } else if (event === null) {
            response.send(JSON.stringify("Event not found."));
        } else {
            // Create and save the new comment
            console.log("Got the event");
            const comment: CalendarEventComment = new CalendarEventComment(event, user, new Date(), content);
            comment.save();
            console.log("Saved the comment");
        }
    });
}
