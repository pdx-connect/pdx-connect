import {Express, Request, Response} from "express";
import {Connection} from "typeorm";
import {Settings} from "../../entity/Settings";

export function route(app: Express, db: Connection) {
    app.get("/api/settings/email-domain", async (request: Request, response: Response) => {
        const settings: Settings = await Settings.findOneOrFail();
        response.send(JSON.stringify(settings.emailDomain));
    });
}
