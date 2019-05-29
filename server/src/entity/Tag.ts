import {BaseEntity, Column, Entity, PrimaryGeneratedColumn, JoinTable, ManyToMany} from "typeorm";

export enum TagType {
    MAJOR = "major"
}

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
        name: "type",
        type: "enum",
        collation: "ascii_bin",
        default: null
    })
    type!: TagType|null;
    
    @JoinTable({
        name: "tag_related",
        joinColumn: {
            name: "tag_id"
        },
        inverseJoinColumn: {
            name: "related_tag_id"
        }
    })
    @ManyToMany(type => Tag, tag => tag.related)
    related!: Promise<Tag[]>;
    
}
