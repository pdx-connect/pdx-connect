import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {User} from "../../entity/User";
import {UserProfile} from "../../entity/UserProfile";
import {Tag} from "../../entity/Tag";
import {ArrayUtils} from "shared/dist/ArrayUtils";
import {CalendarEvent} from "../../entity/CalendarEvent";

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

    // Get user profiles from userIDs
    app.post("/api/user/profilesfromids", async (request: Request, response: Response) => {
        // Establish user and body, temp user object
        const user: User|undefined = request.user;
        const body: {userID: number}[] = request.body;
        let fromDB: UserProfile|undefined = undefined;
        // Define array used to store/send information
        let profiles: {
            userID: number
            userName: string|null
            major: string|null
            onCampus: boolean|null
            description: string|null
        }[] = [];
        // Handle user not logged in
        if (user == null) {
            response.send(JSON.stringify({
                error: "Not logged in."
            }));
            return;
        }
        // Handle bad body
        if (body == null) {
            response.send(JSON.stringify({
                error: "Improper request format"
            }));
            return;
        }
        // Iterate over every requested userID
        for (let i = 0; i < body.length; ++i) {
            fromDB = await UserProfile.findOne({
                where: {
                    id: body[i].userID
                }
            });
            // Push either the username or undefined, depending on query results
            if (fromDB != null) {
                let majorTag: Tag|null = await fromDB.major
                let major: string|null = null;
                if (majorTag != null) {
                    let major: string = majorTag.name
                } else {
                    let major = null;
                }
                profiles.push({
                    userID: fromDB.userID, 
                    userName: (await fromDB.user).displayName,
                    major: major,
                    onCampus: fromDB.isOnCampus,
                    description: fromDB.description
                });
            } else {
                profiles.push({
                    userID: body[i].userID, 
                    userName: null,
                    major: null,
                    onCampus: null,
                    description: null
                });
            }
        }
        // Send result
        response.send(JSON.stringify(profiles));
    });
    /*
    // Get user names from userIDs
    app.post("/api/user/namesfromids", async (request: Request, response: Response) => {
        // Establish user and body, temp user object
        const user: User|undefined = request.user;
        const body: {userID: number}[] = request.body;
        let fromDB: User|undefined = undefined;
        // Define array used to store/send information
        let names: {
            userID: number
            userName: string|undefined
        }[] = [];
        // Handle user not logged in
        if (user == null) {
            response.send(JSON.stringify({
                error: "Not logged in."
            }));
            return;
        }
        // Handle bad body
        if (body == null) {
            response.send(JSON.stringify({
                error: "Improper request format"
            }));
            return;
        }
        // Iterate over every requested userID
        for (let i = 0; i < body.length; ++i) {
            fromDB = await User.findOne({
                where: {
                    id: body[i].userID
                }
            });
            // Push either the username or undefined, depending on query results
            if (fromDB != null) {
                names.push({userID: fromDB.id, userName: fromDB.displayName});
            } else {
                names.push({userID: body[i].userID, userName: undefined});
            }
        }
        // Send result
        response.send(JSON.stringify(names));
    });
    */

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
    // app.post("/api/user/major", async (request: Request, response: Response) => {
    //     if (typeof request.body !== "string") {
    //         response.sendStatus(400);
    //         return;
    //     }
    //     const user: User|undefined = request.user;
    //     //let major: {
    //         //id: number;
    //         //name: string;
    //     //}|null|undefined;
    //     if (user != null) {
    //         const profile: UserProfile|undefined = await user.profile;
    //         if (profile != null) {
    //             profile.major = request.body;
    //             await profile.save();
    //             response.send(JSON.stringify({
    //                 success: true
    //                 //error: ""
    //             }));
    //             // const tag: Tag|null = await profile.major;
    //             // if (tag != null) {
    //             //     major = {
    //             //         id: tag.id,
    //             //         name: tag.name
    //             //     };
    //             // } else {
    //             //     major = null;
    //             // }
    //         } else {
    //             response.send(JSON.stringify({
    //                 error: "Profile not created yet."
    //             }));
    //         }
    //     } else {
    //         response.send(JSON.stringify({
    //             error: "Not logged in."
    //         }));
    //     }
        
    // });


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
            response.send(JSON.stringify(events));
        } else {
            response.send(JSON.stringify("Not logged in."));
        }
    });
}
