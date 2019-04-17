import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {Tag} from "../../entity/Tag";

interface TagData {
    id: number;
    name: string;
}

export function route(app: Express, db: Connection) {
    app.get("/api/tags", async (request: Request, response: Response) => {
        let json: TagData[] | string;
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
    app.get("/api/tags/majors", async (request: Request, response: Response) => {
        let json: TagData[] | string;
        if (request.isAuthenticated()) {
            json = [];
            // Get the major tag
            const majorTag: Tag = await Tag.findMajor();
            // Get all of its leaf nodes, which are all the academia majors
            const majors: Map<number, Tag> = await majorTag.getLeafDescendents();
            for (const [id, tag] of majors) {
                json.push({
                    id: id,
                    name: tag.name
                });
            }
        } else {
            json = "Not logged in.";
        }
        response.send(JSON.stringify(json));
    });
}
