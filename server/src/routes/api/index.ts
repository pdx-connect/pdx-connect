import {Express} from "express";
import {Connection} from "typeorm";
import {route as user} from "./user";
import {route as settings} from "./settings";
import {registerPublicPath} from "../authentication";

registerPublicPath("/api");

export function route(app: Express, db: Connection) {
    user(app, db);
    settings(app, db);
}
