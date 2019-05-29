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
    icon: string;
}

interface ListingData {
    title: string;
    startDate: string;
    description: string;
    tags?: string;
}

interface EventData {
    title: string;
    startDate: string;
    description: string;
    tags?: string;
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
    const year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    let day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return year + '-' + month + '-' + day;
}

export function route(app: Express, db: Connection) {
    app.post("/api/search/profile", async (request: Request, response: Response) => {
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
        const json: UserData[] = await Promise.all(users.map(async user => {
            const userProfile: UserProfile|undefined = await user.profile;
            let majorString = "Not Set";
            let tagsString = "Tags: Not Set";
            let picture = "../resources/matilda.png"
            if (userProfile != null) {
                const majorTag: Tag | null = await userProfile.major;
                const interestTags: Tag[] = await userProfile.interests;
                if (majorTag != null) {
                    majorString = majorTag.name;
                }
                if (interestTags.length > 0) {
                    tagsString = toTagString(interestTags);
                }
                const userProfilePicture: string|null = await userProfile.picture;

                if (userProfilePicture != null) {
                    const picture64 = await Buffer.from(userProfilePicture).toString('base64');
                    picture = (new Buffer(picture64, 'base64')).toString('utf8');
                }
            }
            return {
                userID: user.id,
                displayName: user.displayName,
                major: majorString,
                tags: tagsString,
                icon: picture
            };
        }));
        response.send(JSON.stringify({
            // Send back the array of found user(s)
            results: json
        }));
    });
    app.post("/api/search/listing", async (request: Request, response: Response) => {
        if (typeof request.body.title !== "string") {
            response.sendStatus(400);
            return;
        }
        const listings: Listing[] = await Listing.find({
            where: {
                title: Like("%" + request.body.title + "%"),
                deleted: false
            }
        });
        const json: ListingData[] = await Promise.all(listings.map(async listing => {
            let tagsString = "Tags: Not Set";
            let date = getFormattedDate(listing.timePosted);
            const tags: Tag[] = await listing.tags;
            if (tags.length > 0) {
                tagsString = toTagString(tags);
            }
            return {
                title: listing.title,
                description: listing.description,
                startDate: date,
                tags: tagsString,
            };
        }));
        response.send(JSON.stringify({
            // Send back the array of found listing(s)
                results: json
        }));
    });
    app.post("/api/search/event", async (request: Request, response: Response) => {
        if(typeof request.body.title !== "string") {
            response.sendStatus(400);
            return;
        }
        const events: CalendarEvent[] = await CalendarEvent.find({
            where: {
                title: Like("%" + request.body.title + "%"),
                deleted: false
            }
        });
        const json: EventData[] = await Promise.all(events.map(async event => {
            let tagsString = "Tags: Not Set";
            let date = getFormattedDate(event.start);
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
        response.send(JSON.stringify({
            // Send back the array of found event(s)
            results: json
        }));
    });
}
