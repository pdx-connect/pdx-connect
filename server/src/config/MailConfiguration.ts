/**
 * Specifies the format of the JSON mail configuration file.
 */
export type MailConfiguration = SMTPMailConfiguration | SendMailConfiguration;

export namespace MailConfiguration {

    /**
     * Determines whether the given object has the required shape of a mail configuration.
     * @param obj The object to check.
     */
    export function isInstance(obj: any): obj is MailConfiguration {
        return SMTPMailConfiguration.isInstance(obj) ||
            SendMailConfiguration.isInstance(obj);
    }

}

export interface SMTPMailConfiguration {
    
    /**
     * 
     */
    service: "smtp";

    /**
     * 
     */
    host: string;

    /**
     * 
     */
    port: number;

    /**
     * 
     */
    secure: boolean;

    /**
     * 
     */
    auth: {

        /**
         * 
         */
        user: string;

        /**
         * 
         */
        pass: string;
        
    };
    
}

export namespace SMTPMailConfiguration {

    export function isInstance(obj: any): obj is SMTPMailConfiguration {
        return obj.service === "smtp" &&
            typeof obj.host === "string" &&
            typeof obj.port === "number" &&
            typeof obj.secure === "boolean" &&
            typeof obj.auth === "object" && 
            typeof obj.auth.user === "string" &&
            typeof obj.auth.pass === "string";
    }
    
}

export interface SendMailConfiguration {
    
    service: "sendmail";
    
}

export namespace SendMailConfiguration {

    export function isInstance(obj: any): obj is SendMailConfiguration {
        return obj.service === "sendmail";
    }

}
