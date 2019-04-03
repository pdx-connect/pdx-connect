import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

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
    
    // @ManyToMany(type => Tag, tag => tag.children)
    // parents!: Promise<Tag[]>;
    //
    // @ManyToMany(type => Tag, tag => tag.parents)
    // children!: Promise<Tag[]>;
    //
    // @ManyToMany(type => Tag, tag => tag.related)
    // related!: Promise<Tag[]>;
    
}
