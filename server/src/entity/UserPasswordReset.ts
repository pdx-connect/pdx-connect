import {BaseEntity, Column, Entity, PrimaryColumn} from "typeorm";

@Entity("user_password_reset")
export class UserPasswordReset extends BaseEntity {

    /**
     * The number of milliseconds that a password reset entry lasts for.
     */
    public static readonly DURATION: number = 3600000; // 1 hour
    
    @PrimaryColumn({
        name: "user_id",
        type: "int",
        unsigned: true
    })
    readonly userID!: number;

    @Column({
        name: "reset_code",
        type: "varchar",
        length: 255,
        collation: "ascii_bin",
        comment: "Bcrypt'd reset code."
    })
    resetCode!: string;

    @Column({
        name: "reset_time",
        type: "datetime",
        comment: "The time when the reset code was generated."
    }) 
    resetTime!: Date;
    
    /**
     * Internal constructor.
     */
    constructor();

    /**
     * Creates a new password reset entry for the given user (by ID).
     * @param userID
     * @param resetCode
     * @param resetTime
     */
    constructor(userID: number, resetCode: string, resetTime: Date);
    
    constructor(userID?: number, resetCode?: string, resetTime?: Date) {
        super();
        if (userID != null && resetCode != null && resetTime != null) {
            this.userID = userID;
            this.resetCode = resetCode;
            this.resetTime = resetTime;
        }
    }
    
}
