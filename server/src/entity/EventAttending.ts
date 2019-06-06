import {BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {CalendarEvent} from "./CalendarEvent";
import {User} from "./User";

@Entity("event_attending")
export class EventAttending extends BaseEntity {
    
    @PrimaryColumn({
        name: "event_id",
        type: "int",
        width: 10,
        unsigned: true
    })
    readonly eventID!: number;

    @JoinColumn({
        name: "event_id"
    })
    @ManyToOne(type => CalendarEvent, event => event.attendants, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    readonly event!: Promise<CalendarEvent>;

    @PrimaryColumn({
        name: "user_id",
        type: "int",
        width: 10,
        unsigned: true
    })
    readonly userID!: number;

    @JoinColumn({
        name: "user_id"
    })
    @ManyToOne(type => User, user => user.attending, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    readonly user!: Promise<User>;
    
    /**
     * Internal constructor.
     */
    constructor();

    constructor(event: CalendarEvent, user: User);
    
    constructor(event?: CalendarEvent, user?: User) {
        super();
        if (event != null && user != null) {
            this.eventID = event.id;
            this.event = Promise.resolve(event);
            this.userID = user.id;
            this.user = Promise.resolve(user);
        }
    }

}
