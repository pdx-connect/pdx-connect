import "reflect-metadata";
import * as path from "path";
import * as fs from "fs";
import * as express from "express";
import {Express, Request, Response} from "express";
import {createConnection} from "typeorm";
import {route as api} from "./api";

const clientDirectory: string = path.join(__dirname, "..", "..", "client", "dist");

// Ensure that client code has been built
if (fs.existsSync(clientDirectory)) {
    // Create async context
    (async () => {
        
        // TODO Load in database configuration from JSON file

        // Initialize TypeORM connection to MySQL database
        const db = await createConnection({
            type: "mysql",
            port: 3306,
            entities: [
                __dirname + "/entity/*.js"
            ],
            migrations: [
                __dirname + "/migration/*.js"
            ]
        });

        // Initialize Express app
        const port: number = 9999;
        const app: Express = express();

        // Serve static files from the client directory
        app.use(express.static(clientDirectory));

        // Configure API routes
        api(app);

        // Configure Express to route everything else to React app
        app.get("*", (request: Request, response: Response) => {
            response.sendFile(path.join(clientDirectory, "index.html"));
        });

        // Start Express server
        app.listen(port, () => {
            console.log("Server has started on port: " + port);
        });
    })();
} else {
    console.error("Client does not appear to be compiled.");
    console.error("Run 'npm run client' to build the client package.");
}
