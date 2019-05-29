import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {Tag, TagType} from "../../entity/Tag";

interface TagData {
    id: number;
    name: string;
}

export function route(app: Express, db: Connection) {
    app.get("/api/tags", async (request: Request, response: Response) => {
        let json: TagData[] | string;
        if (request.isAuthenticated()) {
            const tags: Tag[] = await Tag.find();
            json = tags.map(tag => {
                return {
                    id: tag.id,
                    name: tag.name
                };
            });
        } else {
            json = "Not logged in.";
        }
        response.send(JSON.stringify(json));
    });
    app.get("/api/tags/majors", async (request: Request, response: Response) => {
        let json: TagData[] | string;
        if (request.isAuthenticated()) {
            const majorTags: Tag[] = await Tag.find({
                where: {
                    type: TagType.MAJOR
                }
            });
            json = majorTags.map(majorTag => {
                return {
                    id: majorTag.id,
                    name: majorTag.name
                };
            });
        } else {
            json = "Not logged in.";
        }
        response.send(JSON.stringify(json));
    });
    app.get("/api/tags/tree", async (request: Request, response: Response) => {
        let tree: { [type: string]: TagData[] } = Object.create(null);
        if (request.isAuthenticated()) {
            const tags: Tag[] = await Tag.find();
            for (const tag of tags) {
                const tagType: string = tag.type != null ? tag.type.toString() : "";
                let treeTags: TagData[] | undefined = tree[tagType];
                if (treeTags == null) {
                    treeTags = [];
                    tree[tagType] = treeTags;
                }
                treeTags.push({
                    id: tag.id,
                    name: tag.name
                });
            }
        }
        response.send(JSON.stringify(tree));
    });
}
