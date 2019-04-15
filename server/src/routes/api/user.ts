import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {User} from "../../entity/User";
import {UserProfile} from "../../entity/UserProfile";
import {Tag} from "../../entity/Tag";
import {ArrayUtils} from "shared/dist/ArrayUtils";

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

}
