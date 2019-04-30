import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    JoinColumn,
    ManyToOne,
    JoinTable,
    ManyToMany, OneToMany
} from "typeorm";
import {User} from "./User";
import {Tag} from "./Tag";
import {ListingComment} from "./ListingComment";

@Entity("listing")
export class Listing extends BaseEntity {

    @PrimaryGeneratedColumn({
        name: "listing_id",
        type: "int",
        comment: "The unique ID of a listing",
        unsigned: true
    })
    readonly id!: number;

    @Column({
        name: "user_id",
        type: "int",
        width: 10,
        unsigned: true
    })
    readonly userID!: number;

    @JoinColumn({
        name: "user_id"
    })
    @ManyToOne(type => User, user => user.listings, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    readonly user!: Promise<User>;
    
    @Column({
        name: "time_posted",
        type: "datetime",
        comment: "The time this listing was posted",
    })
    readonly timePosted!: Date;

    @Column({
        name: "title",
        type: "varchar",
        length: 255,
        collation: "utf8mb4_unicode_ci",
        comment: "The title of the listing"
    })
    title!: string;

    @Column({
        name: "description",
        type: "text",
        collation: "utf8mb4_bin",
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

    @JoinTable({
        name: "listing_tags",
        joinColumn: {
            name: "listing_id"
        },
        inverseJoinColumn: {
            name: "tag_id"
        }
    })
    @ManyToMany(type => Tag, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    tags!: Promise<Tag[]>;

    @OneToMany(type => ListingComment, comment => comment.listing)
    readonly comments!: Promise<ListingComment[]>;
    
    @Column({
        name: "deleted",
        type: "tinyint",
        width: 1,
        unsigned: true
    })
    deleted!: boolean;
    
    /**
     * Internal constructor.
     */
    constructor();

    /**
     * Creates a new listing posted by the given user
     * @param user
     * @param title
     * @param description
     * @param anonymous
     */
    constructor(user: User, title: string, description: string, anonymous: boolean);
    
    constructor(user?: User, title?: string, description?: string, anonymous?: boolean) {
        super();
        if (user != null && title != null && description != null && anonymous != null) {
            this.userID = user.id;
            this.user = Promise.resolve(user);
            this.timePosted = new Date();
            this.title = title;
            this.description = description;
            this.anonymous = anonymous;
            this.tags = Promise.resolve([]);
            this.comments = Promise.resolve([]);
            this.deleted = false;
        }
    }
    
}
