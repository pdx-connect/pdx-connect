/**
 * Specifies the format of the JSON server configuration file.
 */
export interface ServerConfiguration {

    /**
     * The public host of this server.
     */
    host: string;
    
    /**
     * Optional port (defaults to 80)
     */
    port?: number;
    
    /**
     * The secret key for session management.
     */
    sessionKey?: string;

}

export namespace ServerConfiguration {
    
    /**
     * Determines whether the given object has the required shape of a server configuration.
     * @param obj The object to check.
     */
    export function isInstance(obj: any): obj is ServerConfiguration {
        return (typeof obj.host === "string") &&
            (obj.port === void 0 || typeof obj.port === "number") &&
            (obj.sessionKey === void 0 || typeof obj.sessionKey === "string");
    }

}
