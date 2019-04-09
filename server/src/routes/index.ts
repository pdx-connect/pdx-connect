import {Express} from "express";
import {Connection} from "typeorm";
import {ensureAuthenticated} from "./authentication";
import {route as register} from "./register";
import {route as login} from "./login";
import {route as logout} from "./logout";
import {route as reset} from "./reset";
import {route as api} from "./api";
import {route as ws} from "./ws";
import {route as messages} from "./messages"

export function configure(app: Express, db: Connection) {
    // Configure public vs private routes
    app.use(ensureAuthenticated);
    // Configure all routes
    register(app, db);
    login(app, db);
    logout(app, db);
    reset(app, db);
    api(app, db);
    ws(app, db);
    messages(app, db);
}
