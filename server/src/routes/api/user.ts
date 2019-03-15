import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {User} from "../../entity/User";

export function route(app: Express, db: Connection) {
    app.get("/api/users", async (request: Request, response: Response) => {
        // TODO This is just sample code of how to read user data from the database!
        const users: User[] = await User.find();
        response.send(JSON.stringify(users));
    });
    app.get("/api/user/name", async (request: Request, response: Response) => {
        const user: User|undefined = request.user;
        if (user == null) {
            response.send(JSON.stringify({
                error: "Not logged in"
            }));
            return;
        }
        response.send(JSON.stringify({
            name: user.displayName
        }));
    });
}
