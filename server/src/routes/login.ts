import {Express, NextFunction, Request, Response} from "express";
import {Connection} from "typeorm";
import * as passport from "passport";
import {User} from "../entity/User";
import {registerPublicPath} from "./authentication";

registerPublicPath("/login");

export function route(app: Express, db: Connection) {
    app.post("/login", (request: Request, response: Response, next: NextFunction) => {
        // Post request received!
        // Use passport to authenticate using local strategy
        passport.authenticate("local", (authError: any, user?: User) => {
            // Authentication either succeeded or failed
            if (authError) {
                response.send(JSON.stringify({
                    authError: authError
                }));
            } else if (user != null) {
                // Log-in the authenticated user (passport will create a session)
                request.login(user, (loginError: any) => {
                    if (loginError instanceof Error) {
                        throw loginError;
                    }
                    if (loginError) {
                        response.send(JSON.stringify({
                            loginError: loginError
                        }));
                    } else {
                        response.send(JSON.stringify({
                            success: user.id
                        }));
                    }
                });
            } else {
                response.send(JSON.stringify({
                    error: "Internal server error"
                }));
            }
        })(request, response, next);
    });
}
