import {Express, Request, Response} from "express";
import {Connection, Like} from "typeorm";
import {User} from "../../entity/User";
import {UserProfile} from "../../entity/UserProfile";
import {Tag} from "../../entity/Tag";


export function route(app: Express, db: Connection) {
    app.post("/api/search/profile", async (request: Request, response: Response) => {
        var USERS: Object[]|undefined = undefined;

        if(request.body.searchBy === 1)     // Search by display name
        {
            if (request.body.displayName != null) {
                // Search the DB to find all users with this displayName
                const users: User[] = await User.find({
                    where: {
                        displayName: Like("%" + request.body.displayName + "%")
                    }
                });

                // Create an array of user(s) containing their ID, displayName, major
                USERS = await Promise.all(users.map(async user => {
                    const user_profile: UserProfile|undefined = await user.profile;
                    
                    if(user_profile != undefined){
                        const major_tag: Tag|undefined|null = await user_profile.major;
                                    
                        if(major_tag != null){
                            return {
                                userID: user.id,
                                displayName: user.displayName,
                                major: await major_tag.name
                            };
                        }
                    }    

                    // If the user did not setup his/her major,
                    // return an empty string for the major
                    return {
                        userID: user.id,
                        displayName: user.displayName,
                        major: ""
                    };
                }))
            } else {
                response.sendStatus(400);
            }

        }
        else if(request.body.searchBy === 2)    // Search by major
        {
            if (request.body.major != null) {
                // Found the tag id of the coressponding tag
                const Major: Tag|undefined = await Tag.findOne({
                    where: {
                        name: request.body.major
                    }
                });
    
                if(Major != undefined)
                {
                    // Search the DB to find all users with this major
                    const user_profiles: UserProfile[] = await UserProfile.find({
                        where: {
                            major: Major.id
                        }
                    });

                    // Create an array of user(s) containing their ID, displayName, major
                    USERS = await Promise.all(user_profiles.map(async user_profile => {
                        const user: User = await user_profile.user;

                        return {
                            userID: user_profile.userID,
                            displayName: user.displayName,
                            major: request.body.major
                        };
                    }))
                }
            } else {
                response.sendStatus(400);
            }
        }

        response.send(JSON.stringify({
            // Send back the array of found user(s)
            users: USERS
        }));

    });
}
