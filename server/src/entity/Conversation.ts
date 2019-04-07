import {BaseEntity, Column, Entity, IsNull, Not, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity("conversation")
export class Conversation extends BaseEntity {

    @PrimaryGeneratedColumn({
        name: "conversation_id",
        type: "int",
        comment: "The conversations unique ID",
        unsigned: true
    })
    readonly id!: number;

    /*@Column({
        name: "most_recent", 
        time: "int",
        comment: "Timestamp for most recent message",
        unsigned: true
    })
    timestamp!: number;*/

    @Column({
        name: "archived",
        type: "boolean",
        comment: "Whether the conversation is archived"
    })
    archived!: boolean;
}