import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {CalendarEvent} from "../../entity/CalendarEvent";
import {Tag} from "../../entity/Tag";
import {CalendarEventComment} from "../../entity/CalendarEventComment";
import {User} from "../../entity/User";
import { EventAttending } from "../../entity/EventAttending";


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
    // TODO refactor code 
    var aggregatedCount: any = {};
    const eventCount: EventAttending[] = await EventAttending.find();
    for(var i = 0; i < eventCount.length; i++){
        const eventID = eventCount[i].eventID;
        if(eventID in aggregatedCount){
          aggregatedCount[eventID] = aggregatedCount[eventID] + 1;
        }else{
          aggregatedCount[eventID] = 1;
        }
    }
    const unfilteredEvents: CalendarEvent[] = await CalendarEvent.find();
    var allEvents: any = unfilteredEvents.filter(e => {
      return e.deleted == false;
    });
    for(var i = 0; i < allEvents.length; i++){
      const eventID = allEvents[i].id;
      if (eventID in aggregatedCount){
        allEvents[i].attending = aggregatedCount[eventID];
      }else{
        allEvents[i].attending = 0;
      }     
    }
    response.send(
      JSON.stringify(
        allEvents.map((e:any) => {
          return {
            id: e.id,
            userID: e.userID,
            title: e.title,
            description: e.description,
            start: e.start,
            end: e.end,
            attending: e.attending
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
      const newEvent: CalendarEvent = await new CalendarEvent(
        user,
        title,
        description,
        start,
        end
      ).save();
    }

    response.send(JSON.stringify("Success"));
    return;
  });

  app.put("/api/event/:id", async (request: Request, response: Response) => {
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
      event.title = request.body.title;
      event.description = request.body.description;
      event.start = request.body.start;
      event.end = request.body.end;
      await event.save();
      response.send(
        JSON.stringify({
          success: true
        })
      );
    }
  });

  app.delete("/api/event/:id", async (request: Request, response: Response) => {
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
      event.deleted = true;
      await event.save();
      response.send(
        JSON.stringify({
          success: true
        })
      );
    }
  });

  app.get(
    "/api/event/attending",
    async (request: Request, response: Response) => {
      if (!request.isAuthenticated()) {
        response.send(JSON.stringify("Not logged in."));
        return;
      }

      const eventAttending: EventAttending[] = await EventAttending.find();
      // const allEvents = unfilteredEvents.filter(e => {
      //   return e.deleted == false;
      // });
      response.send(
        JSON.stringify(
          eventAttending.map(e => {
            return {
              event_id: e.eventID,
              userID: e.userID
            };
          })
        )
      );
    }
  );

  app.post(
    "/api/event/attend/:id",
    async (request: Request, response: Response) => {
      if (!request.isAuthenticated()) {
        response.send(JSON.stringify("Not logged in."));
        return;
      }
      const user: User | undefined = request.user;
      const eventId = Number.parseInt(request.params.id);
      if (user !== undefined) {
        const attending:
          | EventAttending
          | undefined = await EventAttending.findOne({
          where: {
            userID: user.id,
            eventID: eventId
          }
        });
        if (attending == null) {
          const addCount = new EventAttending();
          addCount.userID = user.id;
          addCount.eventID = eventId;
          await addCount.save();
          response.send(JSON.stringify("Success"));
          return;
        }else{
          response.send(JSON.stringify("Already registered"));
          return;
        }
      } else {
        response.send(JSON.stringify("Error - not attending"));
        return;
      }
    }
  );

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
