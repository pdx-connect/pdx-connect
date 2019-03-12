import "reflect-metadata";
import * as path from "path";
import * as fs from "fs";
import * as express from "express";
import {Express, Request, Response} from "express";
import session = require("express-session");
import {randomBytes} from "crypto";
import {Connection, createConnection, IsNull, Not} from "typeorm";
import {route as api} from "./api";
import {DatabaseConfiguration} from "./config/DatabaseConfiguration";
import {ServerConfiguration} from "./config/ServerConfiguration";
import * as passport from "passport";
import {Strategy as LocalStrategy} from "passport-local";
import {User} from "./entity/User";
import {UserEmail} from "./entity/UserEmail";
import opn = require("opn");

// TODO Dynamically calculate this value from the program arguments
const developmentMode: boolean = true;

const serverDirectory: string = path.join(__dirname, "..");
const configDirectory: string = path.join(serverDirectory, "config");
const rootDirectory: string = path.join(serverDirectory, "..");
const clientDirectory: string = path.join(rootDirectory, "client");
const publicDirectory: string = path.join(clientDirectory, "dist");

/**
 * Generates a random key for the session management.
 */
function generateSessionKey(): string {
    return randomBytes(64).toString("base64");
}

// Create async context
(async () => {
    // Ensure that client code has been built
    if (!developmentMode && !fs.existsSync(publicDirectory)) {
        console.error("Client does not appear to be compiled.");
        console.error("Run 'npm run client' to build the client package.");
        return;
    }
    
    // Load configuration files
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
    }).catch((err: any) => {
        if (databaseConfig.override) {
            // Return undefined connection (ignoring type-checking)
            // If connection is used later, the program will crash!
            return (void 0)!;
        }
        throw err;
    });
    
    // Initialize session management and user authentication with the "passport" library
    passport.use(new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        session: true
    }, async (email: string, password: string, done) => {
        // Look up user by email
        const userEmail: UserEmail|undefined = await UserEmail.findOne({
            where: {
                email: email,
                activePriority: Not(IsNull()),
                verificationCode: IsNull()
            }
        });
        if (userEmail == null) {
            // TODO Invalid email
            return;
        }
        const user: User = userEmail.user;
        // TODO Compare password
    }));
    passport.serializeUser((user: User, done: (err: any, userID: number) => void) => {
        done(null, user.id);
    });
    passport.deserializeUser(async (userID: number, done: (err: any, user?: User) => void) => {
        try {
            done(null, await User.findOneOrFail({
                where: {
                    id: userID
                }
            }));
        } catch (err) {
            done(err, void 0);
        }
    });
    
    // Initialize Express app
    const port: number = serverConfig.port || 9999;
    const app: Express = express();
    
    if (developmentMode) {
        // Lazy load development module
        require("./dev").init(app);
    }
    
    // Serve static files from the public directory
    app.use(express.static(publicDirectory));
    
    // Configure session support
    app.use(session({
        secret: serverConfig.sessionKey || generateSessionKey(),
        resave: false,
        saveUninitialized: false
        // TODO May need to configure this session more (secure cookies, proxy, session store, etc)
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    
    // Configure API routes
    api(app, db);

    // Configure Express to route everything else to React app
    app.get("*", (request: Request, response: Response) => {
        response.sendFile(path.join(publicDirectory, "index.html"));
    });

    // Start Express server
    app.listen(port, () => {
        console.log("Server has started on port: " + port);
        if (developmentMode) {
            // Open default browser
            opn("http://localhost:" + port).then();
        }
    });
})();
