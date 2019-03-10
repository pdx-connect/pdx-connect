import {BaseEntity, Column, Entity, ManyToOne, PrimaryColumn} from "typeorm";
import {User} from "./User";

@Entity("user_emails")
export class UserEmail extends BaseEntity {
    
    @PrimaryColumn({
        name: "user_id"
    })
    @ManyToOne(type => User, user => user.emails)
    user!: User;
    
    @PrimaryColumn({
        name: "email",
        type: "varchar",
        length: 255,
        collation: "utf8_unicode_ci"
    })
    email!: string;
    
    @Column({
        name: "active_priority",
        type: "tinyint",
        width: 1,
        unsigned: true,
        comment: "NULL is inactive, 1 is primary, 2 is secondary, etc"
    })
    activePriority!: number|null;
    
    @Column({
        name: "verification_code",
        type: "varchar",
        length: 255,
        collation: "ascii_bin",
        comment: "Bcrypt'd verification code. If this is NULL, the user is verified."
    })
    verificationCode!: string|null;
    
    @Column({
        name: "verification_time",
        type: "datetime",
        comment: "The time when the verification code was generated"
    })
    verificationTime!: Date|null;
    
}
