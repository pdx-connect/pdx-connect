import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {CalendarEvent} from "./CalendarEvent";
import {User} from "./User";

@Entity("event_comments")
export class CalendarEventComment extends BaseEntity {
    
    @PrimaryGeneratedColumn({
        name: "comment_id",
        type: "int",
        unsigned: true
    })
    readonly id!: number;
    
    @Column({
        name: "event_id",
        type: "int",
        width: 10,
        unsigned: true
    })
    readonly eventID!: number;
    
    @JoinColumn({
        name: "event_id"
    })
    @ManyToOne(type => CalendarEvent, event => event.comments)
    readonly event!: Promise<CalendarEvent>;
    
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
    @ManyToOne(type => User, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    readonly user!: Promise<User>;
    
    @Column({
        name: "time_posted",
        type: "datetime"
    })
    readonly timePosted!: Date;
    
    @Column({
        name: "content",
        type: "text"
    })
    readonly content!: string;

    /**
     * Internal constructor.
     */
    constructor();

    constructor(event: CalendarEvent, user: User, timePosted: Date, content: string);

    constructor(event?: CalendarEvent, user?: User, timePosted?: Date, content?: string) {
        super();
        if (event != null && user != null && timePosted != null && content != null) {
            this.eventID = event.id;
            this.event = Promise.resolve(event);
            this.userID = user.id;
            this.user = Promise.resolve(user);
            this.timePosted = timePosted;
            this.content = content;
        }
    }

}
