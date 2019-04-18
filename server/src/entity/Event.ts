import {BaseEntity, Column, Entity, JoinColumn, ManyToOne ,IsNull, Not, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User"

@Entity("events")
export class Event extends BaseEntity {
    
    @PrimaryGeneratedColumn({
        name: "event_id",
        type: "int",
        comment: "Event Id",
        unsigned: true
    })
    readonly id!: number;

    @Column({
        name: "title",
        type: "varchar",
        length: 45,
    })
    title!: string;
    
    @Column({
        name: "start",
        type: "datetime"
    })
    readonly start!: Date;
    
    @Column({
        name: "end",
        type: "datetime"
    })
    readonly end!: Date;

    @Column({
        name: "description",
        type: "varchar",
        length: 400,
    })
    description!: string;

    @JoinColumn({
        name: "user_id"
    })
    @ManyToOne(type => User, user => user.events, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    readonly user!: Promise<User| undefined>;
// double check the undefined for the user  

    /**
     * Internal constructor.
     */
    constructor();

   
    constructor(user: User, title: string, start: Date, end: Date, description: string);
    
    constructor(user?: User, title?: string, start?: Date, end?: Date, description?: string) {
        super();
        if (title != null && start != null && end != null && description != null) {
            this.title = title; 
            this.start = start;
            this.end = end;
            this.description = description;
            this.user = Promise.resolve(user);
        }
    }
}