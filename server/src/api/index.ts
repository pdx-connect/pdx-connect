import {Express} from "express";
import {Connection} from "typeorm";
import {route as login} from "./login";
import {route as user} from "./user";

export function route(app: Express, db: Connection) {
    login(app, db);
    user(app, db);
}
