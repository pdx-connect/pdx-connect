import {Express, Request, NextFunction} from "express";
import {Connection} from "typeorm";
import * as expressWs from "express-ws";
import * as ws from "ws";

export function route(app: Express, db: Connection) {
    const appWS: expressWs.Application = expressWs(app).app;

    appWS.ws("/", (socket: ws, req: Request, next: NextFunction) => {
        // TODO Handle websocket connection
        socket.on('open', () => {
            socket.send("Hello")
        });
        socket.on('message', (msg) => {
            socket.send("Got it");
        });
    });
}
