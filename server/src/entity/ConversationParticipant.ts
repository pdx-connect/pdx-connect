import {BaseEntity, Column, PrimaryColumn, Entity, IsNull, Not, ManyToOne, OneToOne, PrimaryGeneratedColumn, JoinColumn} from "typeorm";
import { Conversation } from "./Conversation";
import { User } from "./User"

@Entity("conversation_participants")
export class ConversationParticipant extends BaseEntity {

    @PrimaryColumn({
        name: "conversation_id",
        type: "int",
        comment: "Foreign key to conversation table",
        unsigned: true
    })
    readonly conversationID!: number;

    @JoinColumn({
        name: "conversation_id"
    })
    @ManyToOne(type => Conversation, conversation => conversation.participants, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    readonly conversation!: Promise<Conversation>;

    @PrimaryColumn({
        name: "user_id",
        type: "int",
        unsigned: true,
        comment: "Foreign key to user table	"
    })
    readonly userID!: number; 

    @JoinColumn({
        name: "user_id"
    })
    @ManyToOne(type => User, user => user.conversations, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    readonly user!: Promise<User>;

    @Column({
        name: "last_seen",
        type: "datetime",
        comment: "Time of the most recent seen message"
    })
    lastSeen!: Date | null;

    /**
     * Internal constructor.
     */
    constructor();

    /**
     * Creates an entry indicating that user is in conversation
     * @param conversation
     * @param user
     */
    constructor(conversation: Conversation, user: User);
    
    constructor(conversation?: Conversation, user?: User) {
        super();
        if (conversation != null && user != null) {
            this.conversationID = conversation.id;
            this.conversation = Promise.resolve(conversation);
            this.userID = user.id;
            this.user = Promise.resolve(user);
            this.lastSeen = null;
        }
    }
}