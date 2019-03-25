import {Express, Request, Response} from "express";
import {Connection, IsNull, Not} from "typeorm";
import {registerPublicPath} from "./authentication";
import {sendMail} from "../mail";
import {compare, hash} from "bcrypt";
import {Settings} from "../entity/Settings";
import {User} from "../entity/User";
import {UserEmail} from "../entity/UserEmail";

registerPublicPath("/register");

async function lookupSingleEmail(userID: number): Promise<UserEmail|string> {
    const emails: UserEmail[] = await UserEmail.find({
        where: {
            userID: userID
        }
    });
    if (emails.length == 0) {
        return "No emails found for user.";
    } else if (emails.length > 1) {
        return "More than one email found for user.";
    }
    return emails[0];
}

async function generateVerificationCode(userEmailOrFunction: UserEmail | ((verificationCode: string) => UserEmail)): Promise<UserEmail> {
    const verificationCode: string = await User.generateCode();
    const hashedVerificationCode: string = await hash(verificationCode, 10);
    let userEmail: UserEmail;
    if (typeof userEmailOrFunction === "function") {
        userEmail = userEmailOrFunction(hashedVerificationCode);
    } else {
        userEmail = userEmailOrFunction;
        userEmail.verificationCode = hashedVerificationCode;
        userEmail.verificationTime = new Date();
    }
    await userEmail.save();
    
    // Send verification code to email address
    await sendMail({
        from: "register",
        to: userEmail.email.toLowerCase(),
        subject: "Please confirm your email address",
        text: "Thank you for registering!\n" +
            "Please enter this verification code into the registration form:\n\n" + verificationCode
    });
    
    return userEmail;
}

export function route(app: Express, db: Connection) {
    app.post("/register", async (request: Request, response: Response) => {
        // Parse the request body
        if (typeof request.body !== "object") {
            response.sendStatus(400);
            return;
        }
        const body: any = request.body;
        if (typeof body.displayName !== "string" || 
            typeof body.password !== "string" || 
            typeof body.email !== "string") {
            response.sendStatus(400);
            return;
        }
        
        // Verify inputs
        const displayName: string = body.displayName;
        const password: string = body.password;
        const email: string = body.email.toLowerCase();
        if (displayName.length <= 0) {
            response.send(JSON.stringify({
                error: "Display name cannot be empty."
            }));
            return;
        }
        if (password.length <= 0) {
            response.send(JSON.stringify({
                error: "Password cannot be empty."
            }));
            return;
        }
        const settings: Settings = await Settings.findOneOrFail();
        if (settings.emailDomain != null && !email.endsWith("@" + settings.emailDomain.toLowerCase())) {
            response.send(JSON.stringify({
                error: "Email address is from an unsupported domain."
            }));
            return;
        }
        if (settings.emailDomainUnique) {
            // Verify that email hasn't been used yet
            const existingEmail: UserEmail|undefined = await UserEmail.findOne({
                where: {
                    email: email,
                    activePriority: Not(IsNull()),
                    verificationCode: IsNull()
                }
            });
            if (existingEmail != null) {
                response.send(JSON.stringify({
                    error: "Email is already registered."
                }));
                return;
            }
        }
        
        // Generate new user and save to database
        const hashedPassword: string = await hash(password, 10);
        const newUser: User = await (new User(displayName, hashedPassword).save());
        
        // Generate new email and verification code and save to database
        await generateVerificationCode((verificationCode: string) => {
            return new UserEmail(newUser.id, email, verificationCode);
        });
        
        // Respond with success and user ID (needed for verification route)
        response.send(JSON.stringify({
            userID: newUser.id
        }));
    });
    app.post("/register/resend", async (request: Request, response: Response) => {
        // Parse the request body
        if (typeof request.body !== "object") {
            response.sendStatus(400);
            return;
        }
        const body: any = request.body;
        // Note: Email is only included for additional security/validation
        if (typeof body.userID !== "number" || 
            typeof body.email !== "string") {
            response.sendStatus(400);
            return;
        }
        const userID: number = body.userID;
        const email: string = body.email;
        
        // Lookup single email for user
        const singleEmail: UserEmail|string = await lookupSingleEmail(userID);
        if (typeof singleEmail === "string") {
            response.send(JSON.stringify({
                error: singleEmail
            }));
            return;
        }
        
        // If email doesn't match single email from database, then fail
        if (email.toLowerCase() !== singleEmail.email.toLowerCase()) {
            response.send(JSON.stringify({
                error: "Email does not match email in database."
            }));
            return;
        }
        
        await generateVerificationCode(singleEmail);
        
        response.send(JSON.stringify({
            success: true
        }));
    });
    app.post("/register/verify", async (request: Request, response: Response) => {
        // Parse the request body
        if (typeof request.body !== "object") {
            response.sendStatus(400);
            return;
        }
        const body: any = request.body;
        // Note: Only one email should exist for this user, so email does not need to be included
        if (typeof body.userID !== "number" || 
            typeof body.verificationCode !== "string") {
            response.sendStatus(400);
            return;
        }
        const userID: number = body.userID;
        const verificationCode: string = body.verificationCode;
        const login: boolean = typeof body.login === "boolean" ? body.login : false;
        
        // Lookup single email for user
        const email: UserEmail|string = await lookupSingleEmail(userID);
        if (typeof email === "string") {
            response.send(JSON.stringify({
                error: email
            }));
            return;
        }
        
        // Compare verification code to code in database
        if (email.verificationCode == null) {
            response.send(JSON.stringify({
                error: "Email has already been verified."
            }));
            return;
        }
        if (!(await compare(verificationCode, email.verificationCode))) {
            response.send(JSON.stringify({
                error: "Verification failed."
            }));
            return;
        }
        
        // Email is verified!
        const settings: Settings = await Settings.findOneOrFail();
        if (!settings.emailDomainUnique) {
            // But first, we must find users who had the email previously and notify them
            const existingEmails: UserEmail[] = await UserEmail.find({
                where: {
                    userID: Not(userID),
                    email: email.email
                }
            });
            for (const existingEmail of existingEmails) {
                if (existingEmail.activePriority != null) {
                    if (existingEmail.verificationCode == null) {
                        // Send email to previous user (using alternative email)
                        // TODO
                        // Deactivate existing email for previous user
                        existingEmail.activePriority = null;
                        await existingEmail.save();
                    } else {
                        // Invalid state, treat it as unverified entry to be safe
                        await existingEmail.prune();
                    }
                } else if (existingEmail.verificationCode != null) {
                    // Waiting for verification, delete entry (and user if no more email addresses)
                    await existingEmail.prune();
                } // Else, not active anymore
            }
        }
        
        // Update database to verify email
        email.activePriority = 1;
        email.verificationCode = null;
        await email.save();
        
        // Automatically login user?
        if (login) {
            const user: User = await User.findOneOrFail(userID);
            request.login(user, (loginError: any) => {
                if (loginError instanceof Error) {
                    throw loginError;
                }
                if (loginError) {
                    response.send(JSON.stringify({
                        error: loginError
                    }));
                } else {
                    response.send(JSON.stringify({
                        success: true
                    }));
                }
            });
        } else {
            response.send(JSON.stringify({
                success: true
            }));
        }
    });
    // Note: Interests and personalization is handled by the user API endpoints
}
