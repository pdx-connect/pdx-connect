import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {User} from "../../entity/User";
import {UserProfile} from "../../entity/UserProfile";
import {Tag} from "../../entity/Tag";
import {ArrayUtils} from "shared/dist/ArrayUtils";
import {CalendarEvent} from "../../entity/CalendarEvent";


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

export function route(app: Express, db: Connection) {
    app.get("/api/user/name", async (request: Request, response: Response) => {
        const user: User|undefined = request.user;
        response.send(JSON.stringify({
            name: user != null ? user.displayName : void 0,
            userID: user != null ? user.id: void 0,
        }));
    });

    // Post the user name to the database.
    app.post("/api/user/name", async (request: Request, response: Response) => {
        if (typeof request.body !== "string") {
            response.sendStatus(400);
            return;
        }
        const user: User|undefined = request.user;
        if (user != null) {
            user.displayName = request.body;
            await user.save();
            response.send(JSON.stringify({
                success: true
                //error: ""
            }));
        } else {
            response.send(JSON.stringify({
                error: "Not logged in."
            }));
        }
    });
    // Manage the OOBE (out of box experience)
    app.get("/api/user/oobe", async (request: Request, response: Response) => {
        const user: User|undefined = request.user;
        response.send(JSON.stringify({
            oobe: user != null ? (await user.profile) != null : void 0
        }));
    });
    app.post("/api/user/oobe", async (request: Request, response: Response) => {
        const user: User|undefined = request.user;
        if (user != null) {
            const existingProfile: UserProfile|undefined = await user.profile;
            if (existingProfile != null) {
                response.send(JSON.stringify({
                    error: "Profile already exists."
                }));
            } else {
                await (new UserProfile(user).save());
                response.send(JSON.stringify({
                    success: true
                }));
            }
        } else {
            response.send(JSON.stringify({
                error: "Not logged in."
            }));
        }
    });
    // Manage the user's description/bio
    app.get("/api/user/description", async (request: Request, response: Response) => {
        const user: User|undefined = request.user;
        let description: string|null|undefined;
        if (user != null) {
            const profile: UserProfile|undefined = await user.profile;
            description = profile != null ? profile.description : null;
        } else {
            description = void 0;
        }
        response.send(JSON.stringify({
            description: description
        }));
    });
    // Post the user's profile bio to the database.
    app.post("/api/user/description", async (request: Request, response: Response) => {
        if (typeof request.body !== "string") {
            response.sendStatus(400);
            return;
        }
        const user: User|undefined = request.user;
        if (user != null) {
            const profile: UserProfile|undefined = await user.profile;
            if (profile != null) {
                profile.description = request.body;
                await profile.save();
                response.send(JSON.stringify({
                    success: true
                    //error: ""
                }));
            } else {
                response.send(JSON.stringify({
                    error: "Profile not created yet."
                }));
            }
            
        } else {
            response.send(JSON.stringify({
                error: "Not logged in."
            }));
        }
    });
    // Manage the user's major as a tag and a name
    app.get("/api/user/major", async (request: Request, response: Response) => {
        const user: User|undefined = request.user;
        let major: {
            id: number;
            name: string;
        }|null|undefined;
        if (user != null) {
            const profile: UserProfile|undefined = await user.profile;
            if (profile != null) {
                const tag: Tag|null = await profile.major;
                if (tag != null) {
                    major = {
                        id: tag.id,
                        name: tag.name
                    };
                } else {
                    major = null;
                }
            } else {
                major = void 0;
            }
        } else {
            major = void 0;
        }
        response.send(JSON.stringify({
            major: major
        }));
    });
    // Post major data to the database. 
    app.post("/api/user/major", async (request: Request, response: Response) => {
        // Parse the request body
        // It should be an object.
        if (typeof request.body !== "object") {
            response.sendStatus(400);
            return;
        }

        // Get the request and the major.
        const body: any = request.body;
        const incomingMajor: unknown = body.major;

        // The incoming major should be a number.
        if (typeof incomingMajor !== "number") {
            response.sendStatus(400);
            return;
        }

        const user: User|undefined = request.user;

        if (user != null) {
            const profile: UserProfile|undefined = await user.profile;
            // Find a major whose ID matches what is selected.
            if (profile != null) {
                const incomingTag: Tag | undefined = await Tag.findOne({
                    where: {
                        id: incomingMajor
                    }
                });
                
                // Tag should not be null
                if (incomingTag != null) {
                    profile.major = Promise.resolve(incomingTag);
                    await profile.save();
                    // Send success response
                    response.send(JSON.stringify({
                        success: true
                    }));
                } else {
                    // Send error response
                    response.send(JSON.stringify({
                        error: "Invalid ID for major tag."
                    }));
                }

            } else {
                // Send error response (profile has not been set up)
                response.send(JSON.stringify({
                    error: "Profile has not been set up."
                }));
            }
        } else {
            // User is not logged in
            response.send(JSON.stringify({
                error: "Not logged in."
            }));
        }
    });
    app.post("/api/user/interests", async (request: Request, response: Response) => {
        // Parse the request body
        if (typeof request.body !== "object") {
            response.sendStatus(400);
            return;
        }
        const body: any = request.body;
        if (!Array.isArray(body.interests)) {
            response.sendStatus(400);
            return;
        }

        // Verify inputs
        const incomingInterests: unknown[] = body.interests;

        const user: User|undefined = request.user;
        if (user != null) {
            const profile: UserProfile|undefined = await user.profile;
            if (profile != null) {
                const incomingTags = await Promise.all(incomingInterests.map((id: unknown) => {
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
                    profile.interests = Promise.resolve(incomingTags);
                    await profile.save();
                    // Send success response
                    response.send(JSON.stringify({
                        success: true
                    }));
                } else {
                    // Send error response
                    response.send(JSON.stringify({
                        error: "Invalid ID for interest tag."
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
    app.post("/api/user/personalization", async (request: Request, response: Response) => {
        // Parse the request body
        if (typeof request.body !== "object") {
            response.sendStatus(400);
            return;
        }
        const body: any = request.body;

        // Verify inputs
        const isPublic: boolean = body.isPublic;
        const isTags: boolean = body.isTags;
        const isMiscellaneous: boolean = body.isMiscellaneous;
        const isDirectMessage: boolean = body.isDirectMessage;
        const isProfileComment: boolean = body.isProfileComment;

        const user: User|undefined = request.user;
        if (user != null) {
            const profile: UserProfile|undefined = await user.profile;
            if (profile != null) {
                profile.isPublic = isPublic;
                profile.isTags = isTags;
                profile.isMiscellaneous = isMiscellaneous;
                profile.isDirectMessage = isDirectMessage;
                profile.isProfileComment = isProfileComment;
                
                await profile.save();

                // Send success response
                response.send(JSON.stringify({
                    success: true
                }));
            } else {
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
    app.get("/api/user/events", async (request: Request, response: Response) => {
        const user: User|undefined = request.user;
        if (user != null) {
            const events: CalendarEvent[] = await user.events;
            response.send(JSON.stringify(events.map(e => {
                return {
                    id: e.id,
                    title: e.title,
                    description: e.description,
                    start: e.start,
                    end: e.end
                };
            })));
        } else {
            response.send(JSON.stringify("Not logged in."));
        }
    });
     // Post major data to the database. 
     app.post("/api/user/on_campus", async (request: Request, response: Response) => {
        // Parse the request body
        // It should be an object.
        if (typeof request.body !== "object") {
            response.sendStatus(400);
            return;
        }

        // Get the request and the major.
        const body: any = request.body;
        const isOnCampus: unknown = body.commuterStatus;

        // The incoming major should be a number.
        if (typeof isOnCampus !== "boolean") {
            response.sendStatus(400);
            return;
        }

        const user: User | undefined = request.user;

        if (user != null) {
            const profile: UserProfile | undefined = await user.profile;
            // Find a major whose ID matches what is selected.
            if (profile != null) {
                profile.isOnCampus = isOnCampus;
                await profile.save();
                // Send success response
                response.send(JSON.stringify({
                    success: true
                }));
            } else {
                // Send error response (profile has not been set up)
                response.send(JSON.stringify({
                    error: "Profile has not been set up."
                }));
            }
        } else {
            // User is not logged in
            response.send(JSON.stringify({
                error: "Not logged in."
            }));
        }
    });

    app.post("/api/user/finduser", async (request: Request, response: Response) => {
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
                let commuterString = "Not Set"
                if (userProfile != null) {
                    const description: string|null = await userProfile.description
                    const majorTag: Tag | null = await userProfile.major;
                    const interestTags: Tag[] = await userProfile.interests;
                    const commuterStatus: boolean | null = await userProfile.isOnCampus;
                    if (description != null) {
                        descString = description
                    }
                    if (majorTag != null) {
                        majorString = majorTag.name;
                    }
                    if (interestTags.length > 0) {
                        tagsString = toTagString(interestTags);
                    }
                    if (commuterStatus != null) {
                        if (commuterStatus == true) {
                            commuterString = "On Campus"
                        }
                        else {
                            commuterString = "Off Campus"
                        }
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
                    commuterStatus: commuterString,
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

    app.get("/api/user-profile/picture", async (request: Request, response: Response) => {
        const user: User|undefined = request.user;
        if (user != null) {
            const userProfile: UserProfile|undefined = await user.profile;
            
            if (userProfile != null) {
                const userProfilePicture: string|null = await userProfile.picture;

                if (userProfilePicture != null) {
                    const picture64 = await Buffer.from(userProfilePicture).toString('base64');
                    const picture = (new Buffer(picture64, 'base64')).toString('utf8');

                    response.send(JSON.stringify({
                        picture: picture
                    }));
                    
                } else {
                    response.send(JSON.stringify({
                        picture: ""
                    }));
                }
            } else {
                response.send(JSON.stringify({
                    error: "User profile not found"
                }));
            }
                
        } else {
            response.send(JSON.stringify({
                error: "User not found"
            }));
        }
    });
    app.post("/api/user-profile/picture", async (request: Request, response: Response) => {

        if (typeof request.body !== "object") {
            response.sendStatus(400);
            return;
        }

        // Get the request and the major.
        const body: any = request.body;
        const picture64 =  await Buffer.from(body.picture).toString('base64');
        const picture = (new Buffer(picture64, 'base64')).toString('utf8');

        // The incoming major should be a number.
        if (typeof picture !== "string") {
            response.sendStatus(400);
            return;
        }

        const user: User | undefined = request.user;

        if (user != null) {
            const userProfile: UserProfile | undefined = await user.profile;

            if (userProfile != null) {
                
                userProfile.picture = picture;
                await userProfile.save();
                
                response.send(JSON.stringify({
                    success: true
                }));

            } else {
                
                response.send(JSON.stringify({
                    error: "Picture could not be saved."
                }));
            }
        } else {
            // User is not logged in
            response.send(JSON.stringify({
                error: "Not logged in."
            }));
        }
    });
}
