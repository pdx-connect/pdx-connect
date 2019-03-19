import {Express, NextFunction, Request, Response} from "express";
import {Connection} from "typeorm";

export function route(app: Express, db: Connection) {
    app.post("/register", (request: Request, response: Response, next: NextFunction) => {
        // TODO
    });
}
