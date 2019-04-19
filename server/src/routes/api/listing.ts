import {Express, Request, Response} from "express";
import {Connection, Like} from "typeorm";
import {User} from "../../entity/User";
import {UserProfile} from "../../entity/UserProfile";
import {Tag} from "../../entity/Tag";
import {Listing} from "../../entity/Listing";
import {ListingComments} from "../../entity/ListingComments";


interface xxx {
    userID: number;
    displayName: string;
    major: string;
}

export function route(app: Express, db: Connection) {
   app.post("/api/listings", async (request: Request, response: Response) => {
       let json: xxx[];
       
       json = []
       
       response.send(JSON.stringify({
           // Send back the array of found user(s)
           users: json
       }));
   });

   app.post("/api/current_listing", async (request: Request, response: Response) => {
        let json: xxx[];
        
        json = []
        
        response.send(JSON.stringify({
            // Send back the array of found user(s)
            users: json
        }));
    });

}
