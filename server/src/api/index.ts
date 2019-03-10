import {Express} from "express";

export function route(app: Express) {
    app.get("/api/user/:userID/", () => {
        // TODO
    });
}
