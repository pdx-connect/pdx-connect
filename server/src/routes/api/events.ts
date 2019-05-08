import { Express, Request, Response } from "express";
import { Connection } from "typeorm";
import { CalendarEvent } from "../../entity/CalendarEvent";
import { Tag } from "../../entity/Tag";
import { CalendarEventComment } from "../../entity/CalendarEventComment";
import { User } from "../../entity/User";

async function parseEventByID(
  request: Request
): Promise<CalendarEvent | null | undefined> {
  const id: number = Number.parseInt(request.params.id);
  if (Number.isNaN(id)) {
    return void 0;
  }
  const event: CalendarEvent | undefined = await CalendarEvent.findOne({
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
    response.send(
      JSON.stringify(
        allEvents.map(e => {
          return {
            id: e.id,
            userID: e.userID,
            title: e.title,
            description: e.description,
            start: e.start,
            end: e.end
          };
        })
      )
    );
  });
  app.post("/api/event", async (request: Request, response: Response) => {
    if (!request.isAuthenticated()) {
      response.send(JSON.stringify("Not logged in."));
      return;
    }

    const user: User | undefined = request.user;
    const body = request.body;
    const title = body.title;
    const description = body.description;
    const start = body.start;
    const end = body.end;
    if (user != null) {
      const newEvent: CalendarEvent = await (new CalendarEvent(user, title, description, start, end).save());
    }

    response.send(JSON.stringify("Success"));
    return;
  });
  app.get("/api/event/:id", async (request: Request, response: Response) => {
    if (!request.isAuthenticated()) {
      response.send(JSON.stringify("Not logged in."));
      return;
    }
    const event: CalendarEvent | null | undefined = await parseEventByID(
      request
    );
    if (event === void 0) {
      response.sendStatus(400);
    } else if (event === null) {
      response.send(JSON.stringify("Event not found."));
    } else {
      response.send(
        JSON.stringify({
          userID: event.userID,
          title: event.title,
          description: event.description,
          start: event.start,
          end: event.end
        })
      );
    }
  });
  app.post("/api/event/:id", async (request: Request, response: Response) => {
    if (!request.isAuthenticated()) {
      response.send(JSON.stringify("Not logged in."));
      return;
    }
    const event: CalendarEvent | null | undefined = await parseEventByID(
      request
    );
    if (event === void 0) {
      response.sendStatus(400);
    } else if (event === null) {
      response.send(JSON.stringify("Event not found."));
    } else {
      // TODO Edit an existing event
    }
  });
  app.get(
    "/api/event/:id/tags",
    async (request: Request, response: Response) => {
      if (!request.isAuthenticated()) {
        response.send(JSON.stringify("Not logged in."));
        return;
      }
      const event: CalendarEvent | null | undefined = await parseEventByID(
        request
      );
      if (event === void 0) {
        response.sendStatus(400);
      } else if (event === null) {
        response.send(JSON.stringify("Event not found."));
      } else {
        const tags: Tag[] = await event.tags;
        response.send(
          JSON.stringify(
            tags.map(t => {
              return {
                id: t.id,
                name: t.name
              };
            })
          )
        );
      }
    }
  );
  app.post(
    "/api/event/:id/tags",
    async (request: Request, response: Response) => {
      // TODO Set the tags for a single event
    }
  );
  app.get(
    "/api/event/:id/comments",
    async (request: Request, response: Response) => {
      if (!request.isAuthenticated()) {
        response.send(JSON.stringify("Not logged in."));
        return;
      }
      const event: CalendarEvent | null | undefined = await parseEventByID(
        request
      );
      if (event === void 0) {
        response.sendStatus(400);
      } else if (event === null) {
        response.send(JSON.stringify("Event not found."));
      } else {
        const comments: CalendarEventComment[] = await event.comments;
        response.send(
          JSON.stringify(
            comments.map(c => {
              return {
                id: c.id,
                userID: c.userID,
                timePosted: c.timePosted,
                content: c.content
              };
            })
          )
        );
      }
    }
  );
  app.post(
    "/api/event/:id/comment",
    async (request: Request, response: Response) => {
      // TODO Create a new comment for an event
    }
  );
}
