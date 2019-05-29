import {Express, Request, Response} from "express";
import {Connection, MoreThanOrEqual} from "typeorm";
import {CalendarEvent} from "../../entity/CalendarEvent";
import {Tag} from "../../entity/Tag";
import {CalendarEventComment} from "../../entity/CalendarEventComment";
import {User} from "../../entity/User";
import {UserProfile} from "../../entity/UserProfile"

async function parseEventByID(request: Request): Promise<CalendarEvent|null|undefined> {
    const id: number = Number.parseInt(request.params.id);
    if (Number.isNaN(id)) {
        return void 0;
    }
    const event: CalendarEvent|undefined = await CalendarEvent.findOne({
        where: {
            id: id,
            deleted: false
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
        const allEvents: CalendarEvent[] = await CalendarEvent.find({
            where: {
                deleted: false
            }
        });
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
        const user: User | undefined = request.user;
        if (user == null) {
            response.send(JSON.stringify("Not logged in."));
            return;
        }
        const body = request.body;
        const title = body.title;
        const description = body.description;
        const start = body.start;
        const end = body.end;
        await new CalendarEvent(user, title, description, start, end).save();
        response.send(JSON.stringify("Success"));
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
    app.put("/api/event/:id", async (request: Request, response: Response) => {
        if (!request.isAuthenticated()) {
            response.send(JSON.stringify("Not logged in."));
            return;
        }
        const event: CalendarEvent | null | undefined = await parseEventByID(request);
        if (event === void 0) {
            response.sendStatus(400);
        } else if (event === null) {
            response.send(JSON.stringify("Event not found."));
        } else {
            event.title = request.body.title;
            event.description = request.body.description;
            event.start = request.body.start;
            event.end = request.body.end;
            await event.save();
            response.send(JSON.stringify({
                success: true
            }));
        }
    });
    app.put("/api/event/:id", async (request: Request, response: Response) => {
        if (!request.isAuthenticated()) {
            response.send(JSON.stringify("Not logged in."));
            return;
        }
        const event: CalendarEvent | null | undefined = await parseEventByID(request);
        if (event === void 0) {
            response.sendStatus(400);
        } else if (event === null) {
            response.send(JSON.stringify("Event not found."));
        } else {
            event.title = request.body.title;
            event.description = request.body.description;
            event.start = request.body.start;
            event.end = request.body.end;
            await event.save();
            response.send(JSON.stringify({
                success: true
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
    app.delete("/api/event/:id", async (request: Request, response: Response) => {
        if (!request.isAuthenticated()) {
            response.send(JSON.stringify("Not logged in."));
            return;
        }
        const event: CalendarEvent | null | undefined = await parseEventByID(request);
        if (event === void 0) {
            response.sendStatus(400);
        } else if (event === null) {
            response.send(JSON.stringify("Event not found."));
        } else {
            event.deleted = true;
            await event.save();
            response.send(JSON.stringify({
                success: true
            }));
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
            response.send(JSON.stringify(await Promise.all(comments.map(async (c) => {
                const user: User = await c.user;
                return {
                    id: c.id,
                    userID: c.userID,
                    displayName: user.displayName,
                    timePosted: c.timePosted,
                    content: c.content
                };
            }))));
        }
    });
    app.post("/api/event/:id/comment", async (request: Request, response: Response) => {
        // Get the body of the message, validate format
        const body: any = request.body;
        if (body == null || typeof body !== "object" || typeof body.content !== "string") {
            response.sendStatus(400);
            return;
        }
        // Retrieve the calendar event, verify that it was found
        const event: CalendarEvent|null|undefined = await parseEventByID(request);
        if (event === void 0) {
            response.sendStatus(400);
        } else {
            // Verify that the user is logged in
            const user: User|undefined = request.user;
            if (user == null) {
                response.send(JSON.stringify("Not logged in."));
                return;
            }
            if (event === null) {
                response.send(JSON.stringify("Event not found."));
            } else {
                // Create and save the new comment
                await new CalendarEventComment(event, user, new Date(), body.content).save();
                response.send(JSON.stringify({
                    success: true
                }));
            }
        }
    });
    app.get("/api/events/homeContent", async (request: Request, response: Response) => {
        // Get user
        const user: User|undefined = request.user;
        if (user == null) {
            response.send(JSON.stringify("Not logged in"));
            return;
        }
        // Find user account
        const profile: UserProfile|undefined = await user.profile;
        if (profile == null) {
            response.send(JSON.stringify("No profile for this account"));
            return;
        }
        // Get tags, make array for find query
        const tags: Tag[] = await profile.interests;
        const eventEntries: {
            id: number,
            title: string,
            description: string,
            start: Date,
            end: Date|null
        }[] = [];
        // Get all events which haven't endeded, ordered by start time
        const events: CalendarEvent[] = await CalendarEvent.find({
            where: {
                end: MoreThanOrEqual(Date.now()),
                deleted: false
            },
            order: {
                start: "ASC"
            }
        });
        // Check whether the tags match the user's tags and add them to eventEntries
        for (let i = 0; i < events.length; ++i) {
            let eventTags: Tag[] = await events[i].tags;
            for (let j = 0; j < tags.length; ++j) {
                // Manually search the arrays :(
                let found = false;
                for (let k = 0; k < eventTags.length; ++k) {
                    if (eventTags[k].id == tags[j].id) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    // Get the tag names
                    eventEntries.push({
                        id: events[i].id,
                        title: events[i].title,
                        description: events[i].description,
                        start: events[i].start,
                        end: events[i].start
                    });
                    break;
                }
            }
        }
        response.send(JSON.stringify(eventEntries));
    });
}
