import {Express} from "express";
import {Connection} from "typeorm";
import {route as user} from "./user";
import {route as tags} from "./tags";
import {route as settings} from "./settings";
import {route as search} from "./search";
import {route as listing} from "./listing";
import {route as events} from "./events";
import {route as message} from "./messages";
import {registerPublicPath} from "../authentication";

registerPublicPath("/api");

export function route(app: Express, db: Connection) {
    user(app, db);
    tags(app, db);
    settings(app, db);
    search(app, db);
    listing(app, db);
    events(app, db);
    message(app, db);
}
