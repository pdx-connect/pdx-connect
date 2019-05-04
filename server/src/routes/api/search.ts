import {Express, Request, Response} from "express";
import {Connection, Like} from "typeorm";
import {User} from "../../entity/User";
import {UserProfile} from "../../entity/UserProfile";
import {Tag} from "../../entity/Tag";
import {CalendarEvent} from "../../entity/CalendarEvent"
import {Listing} from "../../entity/Listing"

interface UserData {
    userID: number;
    displayName: string;
    major: string;
    tags?: string;
}

interface ListingData {
    title: string;
    startDate: string;
    description: string;
}

function toTagString(tags: Tag[]) {
    let str = "Tags: ";
    for (let i = 0; i < tags.length; ++i) {
        str = str.concat(tags[i].name);
        if (i < tags.length - 1) {
            str = str.concat(", ");
        }
    }
    return str;
}

function getFormattedDate(date : Date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return year + '-' + month + '-' + day;
}

export function route(app: Express, db: Connection) {
   app.post("/api/search/profile", async (request: Request, response: Response) => {
       let json : any
       if(request.body.searchBy === 1)     // Search by display name
       {
           if (typeof request.body.displayName !== "string") {
               response.sendStatus(400);
               return;
           }
           // Search the DB to find all users with this displayName
           const users: User[] = await User.find({
               where: {
                   displayName: Like("%" + request.body.displayName + "%")
               }
           });

           // Create an array of user(s) containing their ID, displayName, major
           json = await Promise.all(users.map(async user => {
               const userProfile: UserProfile|undefined = await user.profile;
               let majorString = "Not Set";
               let tagsString = "Tags: Not Set";
               if (userProfile != null) {
                   const majorTag: Tag | null = await userProfile.major;
                   const interestTags: Tag[] = await userProfile.interests;
                   if (majorTag != null) {
                       majorString = majorTag.name;
                   }
                   if (interestTags.length > 0) {
                       tagsString = toTagString(interestTags);
                   }
               }
               return {
                   userID: user.id,
                   displayName: user.displayName,
                   major: majorString,
                   tags: tagsString
               };
           }));
       }
       else if(request.body.searchBy === 2)    // Search by listing
       {
            if (typeof request.body.title !== "string") {
               response.sendStatus(400);
               return;
            }
            const listings: Listing[] = await Listing.find({
                where: {
                    title: Like("%" + request.body.title + "%")
                }
            });
            json = await Promise.all(listings.map(async listing => {
                let tagsString = "Tags: Not Set";
                let date = getFormattedDate(listing.timePosted)
                const tags: Tag[] = await listing.tags;
                if (tags.length > 0) {
                    tagsString = toTagString(tags);
                }
                return {
                    title: listing.title,
                    description: listing.description,
                    startDate: date,
                    tags: tagsString,
                }
            }));
       }
       else if(request.body.searchBy === 3)    // Search by event
       {
            if(typeof request.body.title !== "string") {
                response.sendStatus(400);
                return;
            }
            const events: CalendarEvent[] = await CalendarEvent.find({
                where: {
                    title: Like("%" + request.body.title + "%")
                }
            });
            json = await Promise.all(events.map(async event => {
                let tagsString = "Tags: Not Set";
                let date = getFormattedDate(event.start)
                const tags: Tag[] = await event.tags;
                if (tags.length > 0) {
                    tagsString = toTagString(tags);
                }
                return {
                    title: event.title,
                    description: event.description,
                    startDate: date,
                    tags: tagsString,
                };
            }));
       }
       else {
           json = [];
       }

       response.send(JSON.stringify({
           // Send back the array of found user(s)
           users: json
       }));
   });

    app.post("/api/search/finduser", async (request: Request, response: Response) => {
        let json : any
        if(request.body.userId)     // If there is a userid to search
        {
            // Search the DB to find the user with the userID
            const users: User[] = await User.find({
                where: {
                    id: request.body.userId
                }
            });
 
            // Create an array of user(s) containing their ID, displayName, major
            json = await Promise.all(users.map(async user => {
                const userProfile: UserProfile|undefined = await user.profile;
                let majorString = "Not Set";
                let tagsString = "Tags: Not Set";
                const creationDate = await user.creationDate
                const events = await user.events
                const listings = await user.listings
                let descString = "Not Set"
                if (userProfile != null) {
                    const description: string|null = await userProfile.description
                    const majorTag: Tag | null = await userProfile.major;
                    const interestTags: Tag[] = await userProfile.interests;
                    if (description != null) {
                        descString = description
                    }
                    if (majorTag != null) {
                        majorString = majorTag.name;
                    }
                    if (interestTags.length > 0) {
                        tagsString = toTagString(interestTags);
                    }
                }
                return {
                    userID: user.id,
                    displayName: user.displayName,
                    major: majorString,
                    tags: tagsString,
                    creationDate: creationDate,
                    events: events,
                    listings: listings,
                    description: descString,
                };
            }));
        }
        else{
            response.sendStatus(400)
            return;
        }

        response.send(JSON.stringify({
            // Send back the array of found user(s)
            user: json
        }));
    });
}