import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne, OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import {User} from "./User";
import {Tag} from "./Tag";
import {CalendarEventComment} from "./CalendarEventComment";

@Entity("event")
export class CalendarEvent extends BaseEntity {
    
    @PrimaryGeneratedColumn({
        name: "event_id",
        type: "int",
        comment: "Event Id",
        unsigned: true
    })
    readonly id!: number;

    @Column({
        name: "user_id",
        unsigned: true
    })
    readonly userID!: number;

    @JoinColumn({
        name: "user_id"
    })
    @ManyToOne(type => User, user => user.events, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    readonly user!: Promise<User>;

    @Column({
        name: "title",
        type: "varchar",
        length: 255,
    })
    title!: string;

    @Column({
        name: "description",
        type: "text",
    })
    description!: string;
    
    @Column({
        name: "start",
        type: "datetime"
    })
    start!: Date;
    
    @Column({
        name: "end",
        type: "datetime"
    })
    end!: Date | null;

    @JoinTable({
        name: "event_tags",
        joinColumn: {
            name: "event_id"
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
    
    @OneToMany(type => CalendarEventComment, comment => comment.event)
    readonly comments!: Promise<CalendarEventComment[]>;

    /**
     * Internal constructor.
     */
    constructor();

    constructor(user: User, title: string, description: string, start: Date, end?: Date);
    
    constructor(user?: User, title?: string, description?: string, start?: Date, end?: Date) {
        super();
        if (user != null && title != null && description != null && start != null) {
            this.userID = user.id;
            this.user = Promise.resolve(user);
            this.title = title;
            this.description = description;
            this.start = start;
            this.end = end != null ? end : null;
            this.tags = Promise.resolve([]);
            this.comments = Promise.resolve([]);
        }
    }

}
