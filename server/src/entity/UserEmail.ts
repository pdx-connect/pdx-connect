import {BaseEntity, Column, Entity, PrimaryColumn} from "typeorm";

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
    activePriority?: number;
    
    @Column({
        name: "verification_code",
        type: "varchar",
        length: 255,
        collation: "ascii_bin",
        comment: "Bcrypt'd verification code. If this is NULL, the user is verified."
    })
    verificationCode?: string;
    
    @Column({
        name: "verification_time",
        type: "datetime",
        comment: "The time when the verification code was generated"
    })
    verificationTime?: Date;

    /**
     * Creates a new unverified email for the given user.
     * @param userID
     * @param email
     * @param verificationCode
     * @param verificationTime
     */
    constructor(userID: number, email: string, verificationCode: string, verificationTime: Date) {
        super();
        this.userID = userID;
        this.email = email;
        this.verificationCode = verificationCode;
        this.verificationTime = verificationTime;
    }
    
}
