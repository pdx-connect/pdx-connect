import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {Tag} from "../../entity/Tag";


export function route(app: Express, db: Connection) {    
    function getLeaf(root: Tag[]|undefined, list: string[]) {
        if (root == undefined)
            return;
        
        root.forEach(async function (node) {
            getLeaf(await node.children, list);

            if(node.isParent == false) {
                list.push(node.name);
                console.log(list);
            }
        });
    }

    app.post("/api/tags/academia", async (request: Request, response: Response) => {
        let list: string[] = [];

        // Get the academia tag
        const academiaTag: Tag|undefined =  await Tag.findOne({
            where: {
                name: "Academia"
            }
        });
        // Get all of its leaf nodes, which are all the academia majors
        if(academiaTag != undefined)
        {
            const academiaSublist: Tag[]|undefined = await academiaTag.children;
            if(academiaSublist != undefined) {
                getLeaf(await academiaSublist, list);   // Loop through all the academia subtrees
            }
        }

        response.send(JSON.stringify(list));
    });

    // app.get("/api/tags", async (request: Request, response: Response) => {
    //     let json: {
    //         id: number;
    //         name: string;
    //     }[] | string;
    //     if (request.isAuthenticated()) {
    //         const tags: Tag[] =  await Tag.find();
    //         json = [];
    //         for (const tag of tags) {
    //             json.push({
    //                 id: tag.id,
    //                 name: tag.name
    //             });
    //         }
    //     } else {
    //         json = "Not logged in.";
    //     }
    //     response.send(JSON.stringify(json));
    // });
}
