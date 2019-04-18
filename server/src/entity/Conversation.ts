import {BaseEntity, Column, Entity, IsNull, Not, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { ConversationParticipant } from "./ConversationParticipant";
import { Message } from "./Message";

@Entity("conversation") 
export class Conversation extends BaseEntity {

    @PrimaryGeneratedColumn({
        name: "conversation_id",
        type: "int",
        comment: "The conversations unique ID",
        unsigned: true
    })
    readonly id!: number;

    @Column({
        name: "archived",
        type: "tinyint",
        width: 1,
        comment: "Whether the conversation is archived"
    })
    isArchived!: boolean;

    @Column({
        name: "deactivated",
        type: "tinyint",
        width: 1,
        comment: "Whether the conversation is archived"
    })
    isDeactivated!: boolean;

    @OneToMany(type => ConversationParticipant, participant => participant.conversation)
    readonly participants!: Promise<ConversationParticipant[]>;

    @OneToMany(type => Message, message => message.conversation)
    readonly messages!: Promise<Message[]>;

    constructor() {
        super();
        this.isArchived = false;
        this.isDeactivated = false;
    }
}