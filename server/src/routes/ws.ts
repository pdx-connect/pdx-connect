import {Express, Request, NextFunction} from "express";
import {Connection, ReplSet} from "typeorm";
import * as expressWs from "express-ws";
import * as ws from "ws";
import {User} from "../entity/User";

export function route(app: Express, db: Connection) {
    const appWS: expressWs.Application = expressWs(app).app;

    appWS.ws("/", (socket: ws, req: Request, next: NextFunction) => {
        // TODO Handle websocket connection
        socket.onopen = () => {
            // Define event handlers
            socket.onmessage = () => {
                return;
            };
            socket.onerror = () => {
                return;
            };
            socket.onclose = () => {
                return;
            };
        };
    });
}
