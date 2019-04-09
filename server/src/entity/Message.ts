import {BaseEntity, Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn} from "typeorm";
import {Conversation} from "./Conversation"
import {User} from "./User"


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

    @JoinColumn({
        name: "user_id"
    })
    @ManyToOne(type => User, {
        onDelete: "RESTRICT", 
        onUpdate: "CASCADE",
    })
    readonly user!: Promise<User>;

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

    /**
     * Internal constructor.
     */
    constructor();

    /**
     * Creates a new message in conversation from user
     * @param conversation
     * @param user
     */
    constructor(conversation: Conversation, user: User, content: string);
    
    constructor(conversation?: Conversation, user?: User, content?: string) {
        super();
        if (conversation != null && user != null && content != null) {
            this.conversationID = conversation.id;
            this.conversation = Promise.resolve(conversation);
            this.userID = user.id;
            this.user = Promise.resolve(user);
            this.timeSent = new Date();
            this.content = content;
        }
    }
}