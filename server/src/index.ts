import "reflect-metadata";
import * as path from "path";
import * as fs from "fs";
import * as express from "express";
import {Express, Request, Response} from "express";
import {Connection, createConnection} from "typeorm";
import {route as api} from "./api";
import {DatabaseConfiguration} from "./config/DatabaseConfiguration";
import {ServerConfiguration} from "./config/ServerConfiguration";

const configDirectory: string = path.join(__dirname, "..", "config");
const clientDirectory: string = path.join(__dirname, "..", "..", "client", "dist");

// Create async context
(async () => {
    // Ensure that client code has been built
    if (!fs.existsSync(clientDirectory)) {
        console.error("Client does not appear to be compiled.");
        console.error("Run 'npm run client' to build the client package.");
        return;
    }
    
    const databaseConfigFile: string = path.join(configDirectory, "db.json");
    if (!fs.existsSync(databaseConfigFile)) {
        console.error("No database configuration file: " + databaseConfigFile);
        console.error("See the README.md file for the configuration JSON format.");
        return;
    }
    const databaseConfig: any = JSON.parse(fs.readFileSync(databaseConfigFile, "utf8"));
    if (!DatabaseConfiguration.isInstance(databaseConfig)) {
        console.error("Database configuration file has invalid format!");
        console.error("See the README.md file for the correct JSON format.");
        return;
    }
    
    let serverConfig: ServerConfiguration;
    const serverConfigFile: string = path.join(configDirectory, "server.json");
    if (fs.existsSync(serverConfigFile)) {
        serverConfig = JSON.parse(fs.readFileSync(serverConfigFile, "utf8"));
        if (!ServerConfiguration.isInstance(serverConfig)) {
            console.error("Server configuration file has invalid format!");
            console.error("See the README.md file for the correct JSON format.");
            return;
        }
    } else {
        serverConfig = {};
    }

    // Initialize TypeORM connection to MySQL database
    const db: Connection = await createConnection({
        type: "mysql",
        host: databaseConfig.host,
        port: databaseConfig.port || 3306,
        database: databaseConfig.database,
        username: databaseConfig.username,
        password: databaseConfig.password,
        entities: [
            __dirname + "/entity/*.js"
        ],
        migrations: [
            __dirname + "/migration/*.js"
        ]
    });
    
    // Initialize Express app
    const port: number = serverConfig.port || 9999;
    const app: Express = express();

    // Serve static files from the client directory
    app.use(express.static(clientDirectory));

    // Configure API routes
    api(app, db);

    // Configure Express to route everything else to React app
    app.get("*", (request: Request, response: Response) => {
        response.sendFile(path.join(clientDirectory, "index.html"));
    });

    // Start Express server
    app.listen(port, () => {
        console.log("Server has started on port: " + port);
    });
})();
