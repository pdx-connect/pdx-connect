import {BaseEntity, Column, Entity, PrimaryGeneratedColumn, JoinTable, ManyToMany} from "typeorm";

@Entity("tag")
export class Tag extends BaseEntity {

    @PrimaryGeneratedColumn({
        name: "tag_id",
        type: "int",
        comment: "The unique ID of a tag",
        unsigned: true
    })
    readonly id!: number;
    
    @Column({
        name: "name",
        type: "varchar",
        length: 255,
        collation: "utf8mb4_unicode_ci",
        comment: "The display name of the tag",
        unique: true
    })
    name!: string;


    @Column({
        name: "parent",
        type: "tinyint",
        width: 1,
        unsigned: true
    })
    isParent!: boolean;

    
    @Column({
        name: "child",
        type: "tinyint",
        width: 1,
        unsigned: true
    })
    isChild!: boolean;

    
    @JoinTable({
        name: "tag_children",
        joinColumn: {
            name: "tag_id"
        },
        inverseJoinColumn: {
            name: "child_tag_id"
        }
    })
    @ManyToMany(type => Tag)
    children!: Promise<Tag[]>;


    // @ManyToMany(type => Tag, tag => tag.children)
    // parents!: Promise<Tag[]>;
    //
    // @ManyToMany(type => Tag, tag => tag.related)
    // related!: Promise<Tag[]>;
    
}
