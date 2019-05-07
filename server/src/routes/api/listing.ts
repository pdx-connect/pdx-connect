import {Express, Request, Response} from "express";
import {Connection, Like} from "typeorm";
import {ArrayUtils} from "shared/dist/ArrayUtils";

import {User} from "../../entity/User";
import {UserProfile} from "../../entity/UserProfile";
import {Tag} from "../../entity/Tag";
import {Listing} from "../../entity/Listing";
import {ListingComment} from "../../entity/ListingComment";
import { number } from "prop-types";


interface listing {
    id: number,
    userID: number,
    username: string,
    // userProfile: UserProfile|undefined,
    title: string,
    description: string,
    tags: Tag[],
    anonymous: boolean,
    timePosted: Date,
}

export function route(app: Express, db: Connection) {
   app.get("/api/allListings", async (request: Request, response: Response) => {
        let json: listing[];
        json = [];
        if (request.isAuthenticated()) {
            const Listings: Listing[] =  await Listing.find();
            json = await Promise.all(Listings.map(async listing => {
                return {
                    id: listing.id,
                    userID: listing.userID,
                    username: (await listing.user).displayName,
                    // userProfile: (await listing.user).profile,   // For profile picture
                    title: listing.title,
                    description: listing.description,
                    anonymous: listing.anonymous,
                    timePosted: listing.timePosted,
                    tags: await listing.tags
                };
            }))
        }
        response.send(JSON.stringify(json));
   });


   app.post("/api/edit_listing", async (request: Request, response: Response) => {
        let json: listing[];
        
        json = []
        
        response.send(JSON.stringify({
            // Send back the array of found user(s)
            users: json
        }));
    });


    app.post("/api/createListing", async (request: Request, response: Response) => {
        // Parse the request body
        if (typeof request.body !== "object") {
            response.sendStatus(400);
            return;
        }
        const body: any = request.body;
        if (typeof body.title !== "string" || 
            typeof body.description !== "string" || 
            typeof body.anonymous !== "boolean" ||
            !Array.isArray(body.selectedTags)) {
            response.sendStatus(400);
            return;
        }
        
        // Verify inputs
        const title: string = body.title;
        const description: string = body.description;
        const anonymous: boolean = body.anonymous;
        const selectedTags: Number[] = body.selectedTags;
        if (title.length <= 0) {
            response.send(JSON.stringify({
                error: "Title cannot be empty."
            }));
            return;
        }
        if (description.length <= 0) {
            response.send(JSON.stringify({
                error: "description cannot be empty."
            }));
            return;
        }
        if (selectedTags.length <= 0) {
            response.send(JSON.stringify({
                error: "Tags cannot be empty."
            }));
            return;
        }
        
        // Generate new listing and save to database
        const user: User|undefined = request.user;
        if(user != null)
        {
            const newListing: Listing = await (new Listing(user, title, description, anonymous).save());
            // Add selectedTags
            const incomingListingTags: unknown[] = selectedTags;
            const incomingTags = await Promise.all(incomingListingTags.map((id: unknown) => {
                if (typeof id !== "number") {
                    return void 0;
                }
                return Tag.findOne({
                    where: {
                        id: id
                    }
                });
            }));
            if (ArrayUtils.checkNonNull(incomingTags)) {
                newListing.tags = Promise.resolve(incomingTags);
                await newListing.save();
            }
            response.send(JSON.stringify({
                success: true
            }));
        }
    });

}
