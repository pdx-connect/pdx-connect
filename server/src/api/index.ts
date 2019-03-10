import {Express} from "express";
import {Connection} from "typeorm";

export function route(app: Express, db: Connection) {
    app.get("/api/user/:userID/", () => {
        // TODO
    });
}
