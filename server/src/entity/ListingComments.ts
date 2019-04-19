import {BaseEntity, Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne} from "typeorm";
import {User} from "./User";
import {Listing} from "./Listing";

@Entity("listing_comments")
export class ListingComments extends BaseEntity {

    @PrimaryGeneratedColumn({
        name: "comment_id",
        type: "int",
        comment: "The unique ID of a comment",
        unsigned: true
    })
    readonly id!: number;

   // listing_id
   @JoinColumn({
    name: "listing_id"
    })
    @ManyToOne(type => Listing, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    listingID!: number;

    @JoinColumn({
        name: "listing_id"
    })
    @OneToOne(type => Listing, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    readonly listing!: Promise<Listing>;

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
        comment: "The time this comment is posted",
    })
    time_posted!: Date;

    @Column({
        name: "content",
        type: "varchar",
        length: 255,
        collation: "utf8mb4_unicode_ci",
        comment: "The content of the comment",
    })
    content!: string;


    /**
     * Internal constructor.
     */
    constructor();

    /**
     * Creates a new message in conversation from user
     * @param listing
     * @param user
     * @param content
     */
    constructor(listing?: Listing, user?: User, content?: string);
    
    constructor(listing?: Listing, user?: User, content?: string) {
        super();
        if (listing != null && user != null && content != null) {
            this.listingID = listing.id;
            this.listing = Promise.resolve(listing);
            this.userID = user.id;
            this.user = Promise.resolve(user);
            this.time_posted = new Date();
            this.content = content;
        }
    }

}