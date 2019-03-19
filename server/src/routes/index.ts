import {Express} from "express";
import {Connection} from "typeorm";
import {route as register} from "./register";
import {route as login} from "./login";
import {route as user} from "./api/user";

export function configure(app: Express, db: Connection) {
    register(app, db);
    login(app, db);
    user(app, db);
}
