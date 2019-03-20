import {BaseEntity, Column, Entity, IsNull, JoinColumn, ManyToOne, Not, PrimaryGeneratedColumn} from "typeorm";
import {Tag} from "./Tag";
import {UserEmail} from "./UserEmail";
import {randomBytes} from "crypto";
import {hash} from "bcrypt";

@Entity("user")
export class User extends BaseEntity {
    
    @PrimaryGeneratedColumn({
        name: "user_id",
        type: "int",
        comment: "The primary user ID",
        unsigned: true
    })
    id!: number;

    @Column({
        name: "display_name",
        type: "text",
        collation: "utf8mb4_unicode_520_ci"
    })
    displayName: string;
    
    @Column({
        name: "password",
        type: "varchar",
        length: 255,
        collation: "ascii_bin",
        comment: "Bcrypt'd password"
    })
    password: string;

    // TODO See UserEmail entity
    // @OneToMany(type => UserEmail, userEmail => userEmail.userID)
    // emails!: Promise<UserEmail[]>;
    
    @Column({
        name: "creation_date",
        type: "datetime"
    })
    creationDate: Date;
    
    @Column({
        name: "description",
        type: "text",
        collation: "utf8mb4_bin",
        comment: "About me"
    })
    description?: string;

    @JoinColumn({
        name: "major"
    })
    @ManyToOne(type => Tag)
    major?: Promise<Tag>;
    
    @Column({
        name: "on_campus"
    })
    isOnCampus?: boolean;
    
    @Column({
        name: "deactivated",
        comment: "Users should never be deleted, only deactivated"
    })
    deactivated: boolean;

    /**
     * Create a new user.
     * @param displayName
     * @param password
     * @param creationDate
     */
    constructor(displayName: string, password: string, creationDate: Date) {
        super();
        this.displayName = displayName;
        this.password = password;
        this.creationDate = creationDate;
        this.deactivated = false;
    }
    
    /**
     * 
     * @param email
     */
    public static async findActiveByEmail(email: string): Promise<User|string> {
        const userEmail: UserEmail|undefined = await UserEmail.findOne({
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
        return User.findOneOrFail(userEmail.userID);
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
