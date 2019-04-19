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
    start!: Date;
    
    @Column({
        name: "end",
        type: "datetime"
    })
    end!: Date;

    @Column({
        name: "description",
        type: "varchar",
        length: 400,
    })
    description!: string;

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

    /**
     * Internal constructor.
     */
    constructor();

   
    constructor(user: User, title: string, start: Date, end: Date, description: string);
    
    constructor(user?: User, title?: string, start?: Date, end?: Date, description?: string) {
        super();
        if (user != null && title != null && start != null && end != null && description != null) {
            this.title = title; 
            this.start = start;
            this.end = end;
            this.description = description;
            this.userID = user.id
            this.user = Promise.resolve(user);
        }
    }
}