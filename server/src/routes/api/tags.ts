import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {Tag, TagType} from "../../entity/Tag";

interface TagData {
    id: number;
    name: string;
}

interface Node {
    name: string;
    children: Node[];
}

export function route(app: Express, db: Connection) {
    app.get("/api/tags", async (request: Request, response: Response) => {
        let json: TagData[] | string;
        if (request.isAuthenticated()) {
            const tags: Tag[] =  await Tag.find();
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
    app.get("/api/tags/allBaseTags", async (request: Request, response: Response) => {
        let json: TagData[] | string;
        if (request.isAuthenticated()) {
            json = [];
            // let parents: Tag[] = [];
            //
            // const tags: Tag[] =  await Tag.find();
            // // Gets all the most top level parent tags' name
            // for (const tag of tags) {
            //     if(Object.keys(await tag.parents).length == 0)
            //     {
            //         parents.push(tag);
            //     }
            // }
            //
            // // Loop through to find all their leaf nodes
            // for(const parent of parents)
            // {
            //     const children: Map<number, Tag> = await parent.getLeafDescendents();
            //     for (const [id, tag] of children)
            //     {
            //         json.push({
            //             id: id,
            //             name: tag.name
            //         });                
            //     }
            // }
        } else {
            json = "Not logged in.";
        }
        response.send(JSON.stringify(json));
    });


    // The most top level parent tags
    app.get("/api/tags/tagTree", async (request: Request, response: Response) => {
        let tagTree: Node[];
        if (request.isAuthenticated()) {
            // const tags: Tag[] =  await Tag.find();
            // const topTags: Node[] = [];
            // // Gets all the most top level parent tags' name
            // for (const tag of tags) {
            //     if(Object.keys(await tag.parents).length == 0)
            //     {
            //         topTags.push({
            //             name: tag.name,
            //             children: []
            //         });
            //     }
            // }
            // // Build a tree structure of the entire tag relation db
            // tagTree = await treeTraversal(topTags);
            tagTree = [];
        } else {
            tagTree = [];
        }
        response.send(JSON.stringify(tagTree));
    });

    // // Recursive function
    // async function treeTraversal(parent: Node[]): Promise<Node[]> {
    //     // Add children
    //     for(const subtree of parent) {
    //         subtree.children = await findChildren(subtree.name);
    //     }
    //
    //     for(const subtree of parent) {
    //         subtree.children = await treeTraversal(subtree.children);
    //     }
    //     return parent;
    // }
    //
    // // Helper function
    // async function findChildren(name: string):Promise<Node[]> {
    //     let subtrees: Node[] = [];
    //     const current: Tag|undefined = await Tag.findOne({
    //         name: name
    //     })
    //     if(current)
    //     {
    //         for (const child of await current.children)
    //         {
    //             const temp: Node = {
    //                 name: child.name,
    //                 children: []
    //             }
    //             subtrees.push(temp);
    //         }
    //     }
    //     return subtrees;
    // }
}
