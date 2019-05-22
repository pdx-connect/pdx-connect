import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne, OneToMany,
    PrimaryGeneratedColumn,
    PrimaryColumn
} from "typeorm";
import {User} from "./User";
import {CalendarEvent} from "./CalendarEvent";

@Entity("event_attending")
export class EventAttending extends BaseEntity {
    @PrimaryColumn({
        name: "event_id",
        type: "int",
        width: 10,
        unsigned: true
    })
    eventID!: number;

    @JoinColumn({
        name: "event_id"
    })

    @PrimaryColumn({
        name: "user_id",
        type: "int",
        width: 10,
        unsigned: true
    })
    userID!: number;

    @JoinColumn({
        name: "user_id"
    })
    @ManyToOne(type => User, user => user.attending, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    readonly user!: Promise<User>;


    
    /**
     * Internal constructor.
     */
    constructor();

    constructor(user: User, event_id?: number);
    
    constructor(user?: User, event_id?: number) {
        super();
        if (user != null && event_id != null) {
            this.userID = user.id;
            this.user = Promise.resolve(user);
            this.eventID = event_id;
        }
    }

}
