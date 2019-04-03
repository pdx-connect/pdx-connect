import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {Tag} from "../../entity/Tag";

export function route(app: Express, db: Connection) {
    app.get("/api/tags", async (request: Request, response: Response) => {
        let json: {
            id: number;
            name: string;
        }[] | string;
        if (request.isAuthenticated()) {
            const tags: Tag[] =  await Tag.find();
            json = [];
            for (const tag of tags) {
                json.push({
                    id: tag.id,
                    name: tag.name
                });
            }
        } else {
            json = "Not logged in.";
        }
        response.send(JSON.stringify(json));
    });
}
