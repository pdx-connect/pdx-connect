import {createTransport, SentMessageInfo, Transport, Transporter} from "nodemailer";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";
import * as SendmailTransport from "nodemailer/lib/sendmail-transport";
import * as Mail from "nodemailer/lib/mailer";
import MailMessage = require("nodemailer/lib/mailer/mail-message");

let transporter: Transporter|undefined;

/**
 * Initializes the nodemailer transporter with the given SMTP options.
 * If no options are provided, the Linux sendmail binary is provided.
 */
export async function init(options?: SMTPTransport.Options | SendmailTransport.Options) {
    if (transporter != null) {
        throw new Error("Mail transporter is already initialized.");
    }
    if (options) {
        // Use SMTP server or Linux sendmail binary
        transporter = createTransport(options);
    } else {
        // Use console log transport for debugging
        transporter = createTransport(new ConsoleLogTransport());
    }
}

/**
 * Sends mail using the initialized transporter.
 */
export async function sendMail(options: Mail.Options): Promise<SentMessageInfo> {
    if (transporter == null) {
        throw new Error("Mail transporter is not initialized.");
    }
    // Send mail using initialized transporter
    return transporter.sendMail(options);
}

class ConsoleLogTransport implements Transport {
    
    public readonly name: string = "";
    public readonly version: string = "1.0.0";
    
    /**
     * @override
     */
    public send(mail: MailMessage, callback: (err: (Error | null), info: SentMessageInfo) => void): void {
        console.log("Email sent from `" + mail.data.from + "` to `" + mail.data.to + "` with subject: " + mail.data.subject);
        if (mail.data.text != null) {
            console.log(mail.data.text);
        } else if (mail.data.html != null) {
            console.log(mail.data.html);
        } else {
            console.log("<No email body>");
        }
        callback(null, void 0);
    }
    
}
