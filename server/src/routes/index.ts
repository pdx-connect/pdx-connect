import {Express} from "express";
import {Connection} from "typeorm";
import {ensureAuthenticated} from "./authentication";
import {route as register} from "./register";
import {route as login} from "./login";
import {route as reset} from "./reset";
import {route as api} from "./api";

export function configure(app: Express, db: Connection) {
    // Configure public vs private routes
    app.use(ensureAuthenticated);
    // Configure all routes
    register(app, db);
    login(app, db);
    reset(app, db);
    api(app, db);
}
