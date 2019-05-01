import {BaseEntity, Column, Entity, IsNull, Not, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserEmail} from "./UserEmail";
import {randomBytes} from "crypto";
import {hash} from "bcrypt";
import {UserProfile} from "./UserProfile";
import {CalendarEvent} from "./CalendarEvent";
import {Listing} from "./Listing";

@Entity("user")
export class User extends BaseEntity {
    
    @PrimaryGeneratedColumn({
        name: "user_id",
        type: "int",
        comment: "The primary user ID",
        unsigned: true
    })
    readonly id!: number;

    @Column({
        name: "display_name",
        type: "text",
        collation: "utf8mb4_unicode_520_ci"
    })
    displayName!: string;

    @OneToMany(type => UserEmail, userEmail => userEmail.user)
    readonly emails!: Promise<UserEmail[]>;
    
    @Column({
        name: "password",
        type: "varchar",
        length: 255,
        collation: "ascii_bin",
        comment: "Bcrypt'd password"
    })
    password!: string;
    
    @Column({
        name: "creation_date",
        type: "datetime"
    })
    readonly creationDate!: Date;
    
    @OneToOne(type => UserProfile, profile => profile.user)
    readonly profile!: Promise<UserProfile|undefined>;

    @OneToMany(type => CalendarEvent, event => event.user)
    readonly events!: Promise<CalendarEvent[]>;

    @OneToMany(type => Listing, listing => listing.user)
    readonly listings!: Promise<Listing[]>;

    @Column({
        name: "deactivated",
        comment: "Users should never be deleted, only deactivated"
    })
    deactivated!: boolean;

    /**
     * Internal constructor.
     */
    constructor();

    /**
     * Create a new user.
     * @param displayName
     * @param password
     */
    constructor(displayName: string, password: string);
    
    constructor(displayName?: string, password?: string) {
        super();
        if (displayName != null && password != null) {
            this.displayName = displayName;
            this.emails = Promise.resolve([]);
            this.password = password;
            this.creationDate = new Date();
            this.profile = Promise.resolve(void 0);
            this.events = Promise.resolve([]);
            this.deactivated = false;
        }
    }
    
    /**
     * Deactivates this user and saves to the database.
     */
    public async deactivate(): Promise<this> {
        this.deactivated = true;
        return this.save();
    }
    
    /**
     * 
     * @param email
     */
    public static async findActiveByEmail(email: string): Promise<User|string> {
        const userEmail: UserEmail | undefined = await UserEmail.findOne({
            where: {
                email: email,
                activePriority: Not(IsNull())
            }
        });
        if (userEmail == null) {
            return "Email does not exist.";
        }
        if (userEmail.verificationCode != null) {
            return "Email has not been verified yet.";
        }
        return userEmail.user;
    }

    /**
     * Hashes the given password for a user.
     * @param password
     */
    public static async hashPassword(password: string): Promise<string> {
        return hash(password, 10);
    }
    
    /**
     * Generates a secure random code string (for email verification and password resets)
     * @param count The number of characters to generate.
     */
    public static async generateCode(count: number = 16): Promise<string> {
        return new Promise((resolve, reject) => {
            randomBytes(count, (err: Error | null, buf: Buffer) => {
                if (err != null) {
                    reject(err);
                } else {
                    const alphabet: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                    const scale: number = alphabet.length / 256;
                    let output: string = "";
                    for (let i = 0; i < count; i++) {
                        output += alphabet.charAt(Math.floor(buf[i] * scale));
                    }
                    resolve(output);
                }
            });
        });
    }
    
}
