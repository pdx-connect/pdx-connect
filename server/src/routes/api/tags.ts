import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {Tag} from "../../entity/Tag";

interface TagData {
    id: number;
    name: string;
}

interface node {
    name: string;
    children: node[];
};

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

    app.get("/api/tags/allBaseTags", async (request: Request, response: Response) => {
        let json: TagData[] | string;
        let parents: Tag[];
        if (request.isAuthenticated()) {
            json = [];
            parents = [];

            const tags: Tag[] =  await Tag.find();
            // Gets all the most top level parent tags' name
            for (const tag of tags) {
                if(Object.keys(await tag.parents).length == 0)
                {
                    parents.push(tag);
                }
            }

            // Loop through to find all their leaf nodes
            for(const parent of parents)
            {
                const children: Map<number, Tag> = await parent.getLeafDescendents();
                for (const [id, tag] of children)
                {
                    json.push({
                        id: id,
                        name: tag.name
                    });                
                }
            }
        } else {
            json = "Not logged in.";
        }
        response.send(JSON.stringify(json));
    });


    // The most top level parent tags
    app.get("/api/tags/tagTree", async (request: Request, response: Response) => {
        let json: TagData[] | string;

        let TagTree: node[];
        if (request.isAuthenticated()) {
            json = [];
            TagTree = [];
            const tags: Tag[] =  await Tag.find();
            // Gets all the most top level parent tags' name
            for (const tag of tags) {
                if(Object.keys(await tag.parents).length == 0)
                {
                    TagTree.push({
                        name: tag.name,
                        children: []
                    });
                }
            }
            // Build a tree structure of the entire tag relation db
            TagTree = await treeTraversal(TagTree);

        } else {
            json = "Not logged in.";
            TagTree = [];
        }
        console.log(TagTree);
        response.send(JSON.stringify(TagTree));
    });

    // Recursive function
    async function treeTraversal(parent: node[]): Promise<node[]> {
        // Add children
        for(const subtree of parent) {
            subtree.children = await findChildren(subtree.name);
        }

        for(const subtree of parent) {
            subtree.children = await treeTraversal(subtree.children);
        }
        return parent;
    }

    // Helper function
    async function findChildren(name: string):Promise<node[]> {
        let subtrees: node[] = [];
        const current: Tag|undefined = await Tag.findOne({
            name: name
        })
        if(current)
        {
            for (const child of await current.children)
            {
                const temp: node = {
                    name: child.name,
                    children: []
                }
                subtrees.push(temp);
            }
        }
        return subtrees;
    }
}
