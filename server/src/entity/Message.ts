import {BaseEntity, Column, PrimaryColumn, Entity, IsNull, Not, ManyToOne, JoinColumn, PrimaryGeneratedColumn} from "typeorm";
import {Conversation} from "./Conversation"


@Entity("messages")
export class Message extends BaseEntity {

    @PrimaryGeneratedColumn({
        name: "message_id",
        type: "int",
        comment: "Generated message ID",
        unsigned: true
    })
    readonly id!: number;

    @Column({
        name: "conversation_id",
        type: "int",
        unsigned: true,
        comment: "Foreign key to conversation table	"
    })
    readonly conversationID!: number;

    @JoinColumn({
        name: "conversation_id"
    })
    @ManyToOne(type => Conversation, conversation => conversation.messages, {
        onDelete: "RESTRICT", 
        onUpdate: "CASCADE",
    })
    readonly conversation!: Promise<Conversation>;

    @Column({
        name: "user_id",
        type: "int",
        unsigned: true,
        comment: "Foreign key to user table	"
    })
    readonly userID!: number;

    @Column({
        name: "time_sent",
        type: "datetime",
        comment: "The date and time that the message was sent from the user"
    })
    timeSent!: Date;

    @Column({
        name: "content",
        type: "text",
        collation: "utf8mb4_bin",
        comment: "The actual message"
    })
    content!: string;
}