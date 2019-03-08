import * as express from "express";
import {Express, Request, Response} from "express";

const port: number = 9999;
const app: Express = express();

app.get("/", (request: Request, response: Response) => {
    response.send("Hello, world!");
});

app.listen(port, () => {
    console.log("Server has started on port: " + port);
});
