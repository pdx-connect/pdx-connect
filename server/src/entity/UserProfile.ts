import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToOne,
    PrimaryColumn
} from "typeorm";
import {User} from "./User";
import {Tag} from "./Tag";
import {Listing} from "./Listing";

@Entity("user_profile")
export class UserProfile extends BaseEntity {
    
    @PrimaryColumn({
        name: "user_id",
        type: "int",
        comment: "The owner of this profile",
        unsigned: true
    })
    readonly userID!: number;
    
    @JoinColumn({
        name: "user_id"
    })
    @OneToOne(type => User, user => user.profile, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    readonly user!: Promise<User>;
    
    @Column({
        name: "description",
        type: "text",
        collation: "utf8mb4_bin",
        comment: "About me"
    })
    description!: string|null;
    
    @JoinColumn({
        name: "major"
    })
    @ManyToOne(type => Tag, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    major!: Promise<Tag|null>;
    
    @JoinTable({
        name: "user_tags",
        joinColumn: {
            name: "user_id"
        },
        inverseJoinColumn: {
            name: "tag_id"
        }
    })
    @ManyToMany(type => Tag)
    interests!: Promise<Tag[]>;

    @JoinTable({
        name: "user_bookmarked_listings",
        joinColumn: {
            name: "user_id"
        },
        inverseJoinColumn: {
            name: "listing_id"
        }
    })
    @ManyToMany(type => Listing)
    bookmarkedListings!: Promise<Listing[]>;
    
    @Column({
        name: "on_campus",
        type: "tinyint",
        width: 1,
        unsigned: true
    })
    isOnCampus!: boolean|null;
    
    @Column({
        name: "public",
        type: "tinyint",
        width: 1,
        unsigned: true
    })
    isPublic!: boolean;

    @Column({
        name: "tags",
        type: "tinyint",
        width: 1,
        unsigned: true
    })
    isTags!: boolean;

    @Column({
        name: "miscellaneous",
        type: "tinyint",
        width: 1,
        unsigned: true
    })
    isMiscellaneous!: boolean;

    @Column({
        name: "direct_message",
        type: "tinyint",
        width: 1,
        unsigned: true
    })
    isDirectMessage!: boolean;

    @Column({
        name: "profile_comment",
        type: "tinyint",
        width: 1,
        unsigned: true
    })
    isProfileComment!: boolean;

    @Column({
        name: "picture",
        type: "mediumblob",
        comment: "About me"
    })
    picture!: string|null;
    
    /**
     * Internal constructor.
     */
    constructor();

    /**
     * Create a new profile for the given user.
     * @param user
     */
    constructor(user: User);
    
    /**
     * Create a new profile for the given user.
     * @param user
     */
    constructor(user?: User) {
        super();
        if (user) {
            this.userID = user.id;
            this.user = Promise.resolve(user);
            this.description = null;
            this.major = Promise.resolve(null);
            this.interests = Promise.resolve([]);
            this.bookmarkedListings = Promise.resolve([]);
            this.isOnCampus = null;
            this.isPublic = true;
            this.isTags = true;
            this.isMiscellaneous = true;
            this.isDirectMessage = true;
            this.isProfileComment = true;
            this.picture = null;

        }
    }
    
}
