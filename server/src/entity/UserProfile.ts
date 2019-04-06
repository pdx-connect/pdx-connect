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
    
    @Column({
        name: "on_campus",
        type: "tinyint",
        width: 1,
        unsigned: true
    })
    isOnCampus!: boolean|null;
    
    @Column({
        name: "private",
        type: "tinyint",
        width: 1,
        unsigned: true
    })
    isPrivate!: boolean;

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
            this.isOnCampus = null;
            this.isPrivate = false;
            this.isTags = true;
            this.isMiscellaneous = true;
            this.isDirectMessage = true;
            this.isProfileComment = true;

        }
    }
    
}
