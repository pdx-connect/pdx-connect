import {Express} from "express";
import {Connection} from "typeorm";
import {ensureAuthenticated} from "./authentication";
import {route as login} from "./login";
import {route as user} from "./api/user";

export function configure(app: Express, db: Connection) {
    // Configure public vs private routes
    app.use(ensureAuthenticated);
    // Configure all routes
    login(app, db);
    user(app, db);
}
