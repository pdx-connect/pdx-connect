import {Express, Request, Response} from "express";
import {Connection, Like} from "typeorm";
import {User} from "../../entity/User";
import {UserProfile} from "../../entity/UserProfile";
import {Tag} from "../../entity/Tag";

interface UserData {
    userID: number;
    displayName: string;
    major: string;
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

export function route(app: Express, db: Connection) {
   app.post("/api/search/profile", async (request: Request, response: Response) => {
       let json: UserData[];
       
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
       else if(request.body.searchBy === 2)    // Search by major
       {
           if (typeof request.body.major !== "string") {
               response.sendStatus(400);
               return;
           }
           // Found the tag id of the corresponding tag
           const majorTag: Tag|undefined = await Tag.findOne({
               where: {
                   name: request.body.major
               }
           });
           if (majorTag != null) {
               // Search the DB to find all users with this major
               const userProfiles: UserProfile[] = await UserProfile.find({
                   where: {
                       major: majorTag.id
                   }
               });

               // Create an array of user(s) containing their ID, displayName, major
               json = await Promise.all(userProfiles.map(async userProfile => {
                   const user: User = await userProfile.user;
                   return {
                       userID: user.id,
                       displayName: user.displayName,
                       major: majorTag.name
                   };
               }))
           } else {
               json = [];
           }
       } else {
           json = [];
       }

       response.send(JSON.stringify({
           // Send back the array of found user(s)
           users: json
       }));
   });
}
