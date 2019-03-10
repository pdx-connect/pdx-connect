/**
 * Specifies the format of the JSON database configuration file.
 */
export interface DatabaseConfiguration {

    /**
     * The domain or hostname of the system serving the database.
     */
    host: string;

    /**
     * Optional port (defaults to 3306)
     */
    port?: number;

    /**
     * The name of the database to connect to.
     */
    database: string;

    /**
     * The username of the authorized user to connect to the database with.
     */
    username: string;

    /**
     * The password of the authorized user to connect to the database with.
     */
    password: string;
    
}

export namespace DatabaseConfiguration {

    /**
     * Determines whether the given object has the required shape of a database configuration.
     * @param obj The object to check.
     */
    export function isInstance(obj: any): obj is DatabaseConfiguration {
        return typeof obj.host === "string" &&
            (obj.port === void 0 || typeof obj.port === "number") &&
            typeof obj.database === "string" &&
            typeof obj.username === "string" &&
            typeof obj.password === "string";
    }
    
}
