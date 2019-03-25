import {Express, NextFunction, Request, Response} from "express";
import {Connection} from "typeorm";
import {registerPublicPath} from "./authentication";
import {User} from "../entity/User";
import {compare, hash} from "bcrypt";
import {UserPasswordReset} from "../entity/UserPasswordReset";
import {sendMail} from "../mail";

registerPublicPath("/reset");

async function verify(email: string, verificationCode: string): Promise<[User, UserPasswordReset]|string> {
    // Lookup user by email
    const user: User|string = await User.findActiveByEmail(email);
    if (typeof user === "string") {
        return user;
    }
    const userPasswordReset: UserPasswordReset|undefined = await UserPasswordReset.findOne(user.id);
    if (userPasswordReset == null) {
        return "No password reset in progress.";
    }
    // Check reset time
    if (new Date().getTime() > (userPasswordReset.resetTime.getTime() + UserPasswordReset.DURATION)) {
        return "Password reset has expired.";
    }
    // Compare verification code with reset code in database
    if (!(await compare(verificationCode, userPasswordReset.resetCode))) {
        // Failed verification
        return "Verification failed.";
    }
    // Return valid combo
    return [user, userPasswordReset];
}

export function route(app: Express, db: Connection) {
    app.post("/reset", async (request: Request, response: Response) => {
        if (typeof request.body !== "object") {
            response.sendStatus(400);
            return;
        }
        const body: any = request.body;
        if (typeof body.email !== "string") {
            response.sendStatus(400);
            return;
        }
        const email: string = body.email;
        // Lookup user by email
        const user: User|string = await User.findActiveByEmail(email);
        if (typeof user === "string") {
            response.send(JSON.stringify({
                error: user
            }));
            return;
        }
        // Generate reset code and hash reset code before storing in database
        const resetCode: string = await User.generateCode();
        const hashedResetCode: string = await hash(resetCode, 10);
        // Generate password reset entry in database (with bcrypted reset code)
        let userPasswordReset: UserPasswordReset|undefined = await UserPasswordReset.findOne(user.id);
        if (userPasswordReset) {
            // Existing password reset, modify existing one:
            userPasswordReset.resetCode = hashedResetCode;
            userPasswordReset.resetTime = new Date();
        } else {
            // No existing password reset, create a new one:
            userPasswordReset = new UserPasswordReset(user.id, hashedResetCode, new Date());
        }
        await userPasswordReset.save();
        // Send email to user
        await sendMail({
            from: "support",
            to: email.toLowerCase(),
            subject: "Password Reset",
            text: "A request was submitted to reset your password.\n" +
                "Verification Code:\n\n" + resetCode
        });
        // Respond with success
        response.send(JSON.stringify({
            success: true
        }));
    });
    app.post("/reset/verify", async (request: Request, response: Response, next: NextFunction) => {
        if (typeof request.body !== "object") {
            response.sendStatus(400);
            return;
        }
        const body: any = request.body;
        if (typeof body.email !== "string" || typeof body.verificationCode !== "string") {
            response.sendStatus(400);
            return;
        }
        const result = await verify(body.email, body.verificationCode);
        if (typeof result === "string") {
            response.send(JSON.stringify({
                error: result
            }));
        } else {
            response.send(JSON.stringify({
                success: true
            }));
        }
    });
    app.post("/reset/confirm", async (request: Request, response: Response, next: NextFunction) => {
        if (typeof request.body !== "object") {
            response.sendStatus(400);
            return;
        }
        const body: any = request.body;
        if (typeof body.email !== "string" || 
            typeof body.verificationCode !== "string" || 
            typeof body.newPassword !== "string") {
            response.sendStatus(400);
            return;
        }
        const result = await verify(body.email, body.verificationCode);
        if (typeof result === "string") {
            response.send(JSON.stringify({
                error: result
            }));
        } else {
            // Apply new password to user and remove reset entry
            const [user, userPasswordReset] = result;
            user.password = await User.hashPassword(body.newPassword);
            await user.save();
            await userPasswordReset.remove();
            // Send success response
            response.send(JSON.stringify({
                success: true
            }));
        }
    });
}
