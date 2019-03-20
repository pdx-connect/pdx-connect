import {Express} from "express";
import {Connection} from "typeorm";
import {route as user} from "./user";
import {registerPublicPath} from "../authentication";

registerPublicPath("/api");

export function route(app: Express, db: Connection) {
    user(app, db);
}
