import {Express} from "express";
import {Connection} from "typeorm";
import * as passport from "passport";

export function route(app: Express, db: Connection) {
    app.post("/api/login", passport.authenticate("local", {
        failureRedirect: "/login"
    }));
}
