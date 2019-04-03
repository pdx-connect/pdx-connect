import "reflect-metadata";
import * as path from "path";
import * as fs from "fs";
import minimist = require("minimist");
import * as express from "express";
import {Express, Request, Response} from "express";
import session = require("express-session");
import {randomBytes} from "crypto";
import {Connection, createConnection} from "typeorm";
import * as routes from "./routes";
import {ServerConfiguration} from "./config/ServerConfiguration";
import {DatabaseConfiguration} from "./config/DatabaseConfiguration";
import {MailConfiguration} from "./config/MailConfiguration";
import * as SendmailTransport from "nodemailer/lib/sendmail-transport";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";
import * as bodyParser from "body-parser";
import * as passport from "passport";
import {Strategy as LocalStrategy} from "passport-local";
import {User} from "./entity/User";
import opn = require("open");
import {init as initMail} from "./mail";
import {compare} from "bcrypt";

interface Args extends minimist.ParsedArgs {
    dev: boolean;
}

const args: Args = minimist<Args>(process.argv.slice(2), {
    boolean: [
        "dev"
    ],
    alias: {
        "d": "dev"
    },
    default: {
        dev: false
    }
});

const serverDirectory: string = path.join(__dirname, "..");
const configDirectory: string = path.join(serverDirectory, "config");
const rootDirectory: string = path.join(serverDirectory, "..");
const clientDirectory: string = path.join(rootDirectory, "client");
const distDirectory: string = path.join(clientDirectory, "dist");
const publicDirectory: string = path.join(distDirectory, "public");

/**
 * Generates a random key for the session management.
 */
function generateSessionKey(): string {
    return randomBytes(64).toString("base64");
}

// Create async context
(async () => {
    // Ensure that client code has been built
    if (!args.dev && !fs.existsSync(distDirectory)) {
        console.error("Client does not appear to be compiled.");
        console.error("Run 'npm run client' to build the client package.");
        return;
    }
    
    // Load configuration files
    let serverConfig: ServerConfiguration;
    const serverConfigFile: string = path.join(configDirectory, "server.json");
    if (fs.existsSync(serverConfigFile)) {
        serverConfig = JSON.parse(fs.readFileSync(serverConfigFile, "utf8"));
        if (!ServerConfiguration.isInstance(serverConfig)) {
            console.error("Server configuration file has invalid format!");
            console.error("See the README.md file for the correct JSON format.");
            return;
        }
    } else if (args.dev) {
        serverConfig = {
            host: "localhost"
        };
    } else {
        console.error("No server configuration file: " + serverConfigFile);
        console.error("See the README.md file for the server configuration JSON format.");
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

    // Initialize mail transport
    const mailConfigFile: string = path.join(configDirectory, "mail.json");
    if (fs.existsSync(mailConfigFile)) {
        const mailConfig = JSON.parse(fs.readFileSync(mailConfigFile, "utf8"));
        if (!MailConfiguration.isInstance(mailConfig)) {
            console.error("Mail configuration file has invalid format!");
            console.error("See the README.md file for the correct JSON format.");
            return;
        }
        switch (mailConfig.service) {
            case "smtp":
                const smtpConfig: SMTPTransport.Options = {
                    service: "smtp",
                    host: mailConfig.host,
                    port: mailConfig.port,
                    secure: mailConfig.secure,
                    auth: {
                        user: mailConfig.auth.user,
                        pass: mailConfig.auth.pass
                    }
                };
                await initMail(serverConfig.host, smtpConfig);
                break;
            case "sendmail":
                const sendmailConfig: SendmailTransport.Options = {
                    sendmail: true
                };
                await initMail(serverConfig.host, sendmailConfig);
                break;
            default:
                throw new Error("Invalid mail service: " + mailConfig!.service);
        }
    } else if (args.dev) {
        await initMail(serverConfig.host);
    } else {
        console.error("No mail configuration file: " + mailConfigFile);
        console.error("See the README.md file for the mail configuration JSON format.");
        return;
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
        const user: User|string = await User.findActiveByEmail(email);
        if (typeof user === "string") {
            done(user);
            return;
        }
        // Check password of user using bcrypt
        if (await compare(password, user.password)) {
            // Success!
            done(null, user);
        } else {
            // Failure!
            done("Password is incorrect.");
        }
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
            done(err);
        }
    });
    
    // Initialize Express app
    const port: number = serverConfig.port || 9999;
    const app: Express = express();
    
    // Serve static files from the public directory
    app.use(express.static(publicDirectory));
    
    // Configure session support
    app.use(session({
        secret: serverConfig.sessionKey || generateSessionKey(),
        resave: false,
        saveUninitialized: false
        // TODO May need to configure this session more (secure cookies, proxy, session store, etc)
    }));
    app.use(bodyParser.json());
    app.use(passport.initialize());
    app.use(passport.session());
    
    // Configure API routes
    routes.configure(app, db);

    if (args.dev) {
        // Lazy load development module
        require("./dev").init(app);
    } else {
        // Configure Express to route everything else to React app
        app.get("*", (request: Request, response: Response) => {
            response.sendFile(path.join(distDirectory, "index.html"));
        });
    }

    // Start Express server
    app.listen(port, async () => {
        console.log("Server has started on port: " + port);
        if (args.dev) {
            // Open default browser
            await opn("http://localhost:" + port);
        }
    });
})();
