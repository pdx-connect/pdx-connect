import {BaseEntity, Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne, JoinTable, ManyToMany, OneToOne} from "typeorm";
import {User} from "./User";
import {Tag} from "./Tag";

@Entity("listing")
export class Listing extends BaseEntity {

    @PrimaryGeneratedColumn({
        name: "listing_id",
        type: "int",
        comment: "The unique ID of a listing",
        unsigned: true
    })
    readonly id!: number;

    // user_id
    @JoinColumn({
        name: "user_id"
    })
    @ManyToOne(type => User, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    userID!: number;

    // Based on the user id, match its user profile
    @JoinColumn({
        name: "user_id"
    })
    @OneToOne(type => User, user => user.profile, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    readonly user!: Promise<User>;


    @Column({
        name: "time_posted",
        type: "datetime",
        comment: "The time this listing is posted",
    })
    time_posted!: Date;
    
    @Column({
        name: "title",
        type: "varchar",
        length: 255,
        collation: "utf8mb4_unicode_ci",
        comment: "The title of the listing",
        unique: true
    })
    title!: string;

    @Column({
        name: "description",
        type: "varchar",
        length: 255,
        collation: "utf8mb4_unicode_ci",
        comment: "The description of the listing",
    })
    description!: string;

    @Column({
        name: "anonymous",
        type: "tinyint",
        width: 1,
        unsigned: true
    })
    anonymous!: boolean;

    @Column({
        name: "deleted",
        type: "tinyint",
        width: 1,
        unsigned: true
    })
    deleted!: boolean|null;
    

    // Join the "listing_tags" table for all related tags
    @JoinTable({
        name: "listing_tags",
        joinColumn: {
            name: "listing_id"
        },
        inverseJoinColumn: {
            name: "tag_id"
        }
    })
    @ManyToMany(type => Tag)
    tags!: Promise<Tag[]>;


    /**
     * Internal constructor.
     */
    constructor();

    /**
     * Creates a new message in conversation from user
     * @param user
     * @param title
     * @param description
     * @param anonymous
     */
    constructor(user?: User, title?: string, description?: string, anonymous?: boolean);
    
    constructor(user?: User, title?: string, description?: string, anonymous?: boolean) {
        super();
        if (user != null && title != null && description != null && anonymous != null) {
            this.userID = user.id;
            this.user = Promise.resolve(user);
            this.time_posted = new Date();
            this.title = title;
            this.description = description;
            this.anonymous = anonymous;
        }
    }
}
