import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {User} from "../../entity/User";
import {UserProfile} from "../../entity/UserProfile";
import {Tag} from "../../entity/Tag";
import {ArrayUtils} from "shared/dist/ArrayUtils";
import {CalendarEvent} from "../../entity/CalendarEvent";

interface UserData {
    userID: number;
    displayName: string;
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
    app.post("/api/user/commuter", async (request: Request, response: Response) => {
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

    app.post("/api/user/findnames", async (request: Request, response: Response) => {
        let json : UserData[]
        // Search the DB to find all users
        const users: User[] = await User.find({
        });

        // Create an array of user(s) containing their ID, displayName
        json = await Promise.all(users.map(async user => {
            return {
                userID: user.id,
                displayName: user.displayName,
            };
        }));
        response.send(JSON.stringify({
            // Send back the array of found user(s)
            results: json
        }));
    });
    // Route which returns display names given an array of userIDs
    app.post("/api/user/names", async (request: Request, response: Response) => {
        // Validate that user is logged in
        response.send(JSON.stringify({6:"Daniel",4:"David"}));
        return;
        /*
        const user: User|undefined = request.user;
        if (user == null || user.id == undefined) {
            response.send(JSON.stringify("Not logged in"));
            return;
        }

        // Get the array of userIDs
        const body = request.body;
        const userIDs: number[]|undefined = body.userIDs;
        if (userIDs == null) {
            response.send(JSON.stringify("Improper request information"));
            return;
        }
        console.log("UserIDs from body");

        let names: {
            [key: number]: string
        } = {};
        // Interate over the userIDs and define them in the names object
        for (let i = 0; i < userIDs.length; ++i) {
            let temp: User|undefined = await User.findOne({
                where: {
                    id: userIDs[i]
                }
            });
            if (temp == null) {
                console.error("User not found");
                response.send(JSON.stringify("Error: invalid userID"));
                return;
            }
            names[userIDs[i]] = temp.displayName;
        }
        console.log("Users found, right before response.send()");
        response.send(JSON.stringify(names));
        return;
        */
    });
}
