import {Express} from "express";
import {Connection} from "typeorm";
import {route as user} from "./user";
import {route as tags} from "./tags";
import {route as settings} from "./settings";
import {registerPublicPath} from "../authentication";
import {route as message} from "./messages"

registerPublicPath("/api");

export function route(app: Express, db: Connection) {
    user(app, db);
    tags(app, db);
    settings(app, db);
    message(app, db);
}
