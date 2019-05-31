import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {ArrayUtils} from "shared/dist/ArrayUtils";

import {User} from "../../entity/User";
import {Tag} from "../../entity/Tag";
import {Listing} from "../../entity/Listing";
import {ListingComment} from "../../entity/ListingComment";
import {UserProfile} from "../../entity/UserProfile";


interface ListingData {
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

// Get the listing by its id
async function parseListingByID(request: Request): Promise<Listing|null|undefined> {
    const id: number = Number.parseInt(request.params.id);
    if (Number.isNaN(id)) {
        return void 0;
    }
    const listing: Listing|undefined = await Listing.findOne({
        where: {
            id: id
        }
    });
    if (listing == null) {
        return null;
    }
    return listing;
}



export function route(app: Express, db: Connection) {
    app.get("/api/listings/allListings", async (request: Request, response: Response) => {
        let json: ListingData[];
        if (request.isAuthenticated()) {
            const listings: Listing[] = await Listing.find({
                where: {
                    deleted: false
                }
            });
            json = await Promise.all(listings.map(async listing => {
                const replyNum: number = await ListingComment.count({
                    where: {
                        listingID: listing.id
                    }
                });

                return {
                    id: listing.id,
                    userID: listing.userID,
                    username: (await listing.user).displayName,
                    // userProfile: (await listing.user).profile,   // For profile picture
                    title: listing.title,
                    description: listing.description,
                    anonymous: listing.anonymous,
                    timePosted: listing.timePosted,
                    tags: await listing.tags,
                    reply: replyNum
                };
            }));
        } else {
            json = [];
        }
        response.send(JSON.stringify(json));
    });
    app.post("/api/listings/edit_listing", async (request: Request, response: Response) => {
        // Parse the request body
        if (request.body == null || typeof request.body !== "object") {
            response.sendStatus(400);
            return;
        }

        // Verify inputs
        const body: any = request.body;
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
        
        // Find the listing, edit, then save to database
        const editListing: Listing|undefined =  await Listing.findOne({
            where: {
                id: request.body.id
            }
        });

        if(editListing)
        {
            editListing.title = request.body.title;
            editListing.description = request.body.description;
            editListing.anonymous = request.body.anonymous;

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
                editListing.tags = Promise.resolve(incomingTags);
                await editListing.save();
            }
            response.send(JSON.stringify({
                success: true
            }));
        }
        else
        {
            response.send(JSON.stringify({
                success: false
            }));
        }
    });

    app.post("/api/listings/delete_listing", async (request: Request, response: Response) => {
        if (typeof request.body.id !== "number") {
            response.sendStatus(400);
            return;
        }

        const json: Listing|undefined =  await Listing.findOne({
            where: {
                id: request.body.id
            }
        });
        if(json)
        {
            json.deleted = true;
            await json.save();
            response.send(JSON.stringify({
                success: true
            }));
        }
        else
        {
            response.send(JSON.stringify({success: false})); 
        }
    });


    app.post("/api/listings/createListing", async (request: Request, response: Response) => {
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
        else
        {
            response.send(JSON.stringify({
                error: "Not logged in."
            }));
        }
    });

    app.post("/api/listing/isBookmark", async (request: Request, response: Response) => {
        const id: number = request.body.id;
        if(id <= 0)
        {
            response.send(JSON.stringify({
                error: "Listing ID cannot be less than 1."
            }));
            return;
        }

        const user: User|undefined = request.user;
        if (user != null) {
            const profile: UserProfile|undefined = await user.profile;
            if (profile != null) {
                let found: boolean = false;
                for(const current of await profile.bookmarkedListings)
                {
                    if(current.id === request.body.id)
                        found = true;
                }
                if(found)
                {
                    response.send(JSON.stringify({
                        bookmarked: true
                    }));
                } else {
                    response.send(JSON.stringify({
                        bookmarked: false
                    }));    
                }
            } else {
                // Send error response
                response.send(JSON.stringify({
                    error: "Profile has not been set up."
                }));
            }
        } else {
            response.send(JSON.stringify({
                error: "Not logged in."
            }));
        }
    });

    // Route for retrieving comments for a listing
    app.get("/api/listing/:id/comments", async (request: Request, response: Response) => {
        if (!request.isAuthenticated()) {
            response.send(JSON.stringify("Not logged in."));
            return;
        }
        const listing: Listing|null|undefined = await parseListingByID(request);
        if (listing === void 0) {
            response.sendStatus(400);
        } else if (listing === null) {
            response.send(JSON.stringify("Event not found."));
        } else {
            const comments: ListingComment[] = await listing.comments;
            response.send(JSON.stringify(await Promise.all(comments.map(async (l) => {
                const user: User = await l.user;
                return {
                    id: l.id,
                    userID: l.userID,
                    displayName: user.displayName,
                    timePosted: l.time_posted,
                    content: l.content
                };
            }))));
        }
    });
    app.post("/api/listing/:id/comment", async (request: Request, response: Response) => {
        // Get the body of the message, validate format
        const body: any = request.body;
        if (body == null || typeof body !== "object" || typeof body.content !== "string") {
            response.sendStatus(400);
            return;
        }
        // Retrieve the calendar event, verify that it was found
        const listing: Listing|null|undefined = await parseListingByID(request);
        if (listing === void 0) {
            response.sendStatus(400);
        } else {
            // Verify that the user is logged in
            const user: User|undefined = request.user;
            if (user == null) {
                response.send(JSON.stringify("Not logged in."));
                return;
            }
            if (listing === null) {
                response.send(JSON.stringify("Listing not found."));
            } else {
                // Create and save the new comment
                await new ListingComment(listing, user, body.content).save();
                response.send(JSON.stringify({
                    success: true
                }));
            }
        }
    });
    app.get("/api/listings/homeContent", async (request: Request, response: Response) => {
        // Get user
        const user: User|undefined = request.user;
        if (user == null) {
            response.send(JSON.stringify("Not logged in"));
            return;
        }
        // Find user account
        const profile: UserProfile|undefined = await user.profile;
        if (profile == null) {
            response.send(JSON.stringify("No profile for this account"));
            return;
        }
        // Get tags, make array for find queries
        const tags: Tag[] = await profile.interests;
        const listingEntries: {
            id: number,
            title: string,
            description: string,
            type: string,
            tags: string[],
            datePosted: Date
        }[] = [];
        // Get all the listings, ordered by post date
        const listings: Listing[] = await Listing.find({
            order: {
                timePosted: "DESC"
            }
        });
        // Check whether the tags match the user's tags and add them to listingEntries
        for (let i = 0; i < listings.length; ++i) {
            let listingTags: Tag[] = await listings[i].tags;
            for (let j = 0; j < tags.length; ++j) {
                // Manually search the arrays :(
                let found = false;
                let tagNames: string[] = [];
                for (let k = 0; k < listingTags.length; ++k) {
                    if (listingTags[k].id == tags[j].id) {
                        found = true;
                    }
                    tagNames.push(listingTags[k].name);
                }
                if (found) {
                    // Get the tag names
                    listingEntries.push({
                        id: listings[i].id,
                        title: listings[i].title,
                        description: listings[i].description,
                        type: "Type Not Implemented Yet",
                        tags: tagNames,
                        datePosted: listings[i].timePosted
                    });
                    break;
                }
            }
        }
        response.send(JSON.stringify(listingEntries));
    });
}
