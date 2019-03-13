import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {User} from "../../entity/User";

export function route(app: Express, db: Connection) {
    app.get("/api/users", async (request: Request, response: Response) => {
        // TODO This is just sample code of how to read user data from the database!
        const users: User[] = await User.find();
        response.send(JSON.stringify(users));
    });
    app.get("/api/user/:userID/", async (request: Request, response: Response) => {
        // TODO
    });
}
