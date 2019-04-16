import {Express, Request, Response} from "express";
import {Connection, Like} from "typeorm";
import {User} from "../../entity/User";
import {UserProfile} from "../../entity/UserProfile";
import {Tag} from "../../entity/Tag";

interface UserData {
    userID: number;
    displayName: string;
    major: string;
}

export function route(app: Express, db: Connection) {
   app.post("/api/search/profile", async (request: Request, response: Response) => {
       let json: UserData[];
       
       if(request.body.searchBy === 1)     // Search by display name
       {
           if (request.body.displayName == null) {
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
               if (userProfile != null) {
                   const majorTag: Tag | null = await userProfile.major;
                   if (majorTag != null) {
                       return {
                           userID: user.id,
                           displayName: user.displayName,
                           major: majorTag.name
                       };
                   }
               }
               return {
                   userID: user.id,
                   displayName: user.displayName,
                   major: ""
               };
           }));
       }
       else if(request.body.searchBy === 2)    // Search by major
       {
           if (request.body.major == null) {
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
