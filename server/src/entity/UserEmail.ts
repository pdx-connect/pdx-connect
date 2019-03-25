import {BaseEntity, Column, Entity, PrimaryColumn} from "typeorm";
import {User} from "./User";

@Entity("user_emails")
export class UserEmail extends BaseEntity {
    
    // TODO Having trouble getting many-to-one relation working with composite primary keys
    
    @PrimaryColumn({
        name: "user_id",
        type: "int",
        unsigned: true
    })
    // @JoinColumn({
    //     name: "user_id"
    // })
    // @ManyToOne(type => User, user => user.emails)
    // user!: User;
    userID: number;
    
    @PrimaryColumn({
        name: "email",
        type: "varchar",
        length: 255,
        collation: "utf8_unicode_ci"
    })
    email: string;
    
    @Column({
        name: "active_priority",
        type: "tinyint",
        width: 1,
        unsigned: true,
        comment: "NULL is inactive, 1 is primary, 2 is secondary, etc"
    })
    activePriority: number|null;
    
    @Column({
        name: "verification_code",
        type: "varchar",
        length: 255,
        collation: "ascii_bin",
        comment: "Bcrypt'd verification code. If this is NULL, the user is verified."
    })
    verificationCode: string|null;
    
    @Column({
        name: "verification_time",
        type: "datetime",
        comment: "The time when the verification code was generated"
    })
    verificationTime: Date|null;

    /**
     * Creates a new unverified email for the given user.
     * @param userID
     * @param email
     * @param verificationCode
     */
    constructor(userID: number, email: string, verificationCode: string) {
        super();
        this.userID = userID;
        this.email = email;
        this.activePriority = null;
        this.verificationCode = verificationCode;
        this.verificationTime = new Date();
    }

    /**
     * Deletes the email entry and the user if no more emails left.
     */
    public async prune(): Promise<this> {
        const userID: number = this.userID;
        const thisEmail: this = await this.remove();
        // Check if user has no more emails
        const count: number = await UserEmail.count({
            where: {
                userID: userID
            }
        });
        if (count <= 0) {
            const user: User|undefined = await User.findOne(userID);
            if (user) {
                try {
                    await user.remove();
                } catch (err) {
                    console.error("Failed to prune user after removing all emails.");
                    await user.deactivate();
                }
            }
        }
        return thisEmail;
    }
    
}
