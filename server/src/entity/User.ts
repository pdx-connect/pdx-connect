import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {UserEmail} from "./UserEmail";
import {Tag} from "./Tag";

@Entity("user")
export class User extends BaseEntity {
    
    @PrimaryGeneratedColumn({
        name: "user_id",
        type: "int",
        comment: "The primary user ID",
        unsigned: true
    })
    id!: number;
    
    @OneToMany(type => UserEmail, userEmail => userEmail.user)
    emails!: Promise<UserEmail[]>;
    
    @Column({
        name: "password",
        type: "varchar",
        length: 255,
        collation: "ascii_bin",
        comment: "Bcrypt'd password"
    })
    password!: string;
    
    @Column({
        name: "display_name",
        type: "text",
        collation: "utf8mb4_unicode_520_ci"
    })
    displayName!: string;
    
    @Column({
        name: "creation_date",
        type: "datetime"
    })
    creationDate!: Date;
    
    @Column({
        name: "description",
        type: "text",
        collation: "utf8mb4_bin",
        comment: "About me"
    })
    description: string|null = null;
    
    @Column({
        name: "major",
        comment: "A reference to an academic major tag"
    })
    major: Promise<Tag>|null = null;
    
    @Column({
        name: "on_campus"
    })
    isOnCampus: boolean|null = null;
    
    @Column({
        name: "deactivated",
        comment: "Users should never be deleted, only deactivated"
    })
    deactivated: boolean = false;
    
}
