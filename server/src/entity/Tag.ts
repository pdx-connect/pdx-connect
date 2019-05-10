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
    
    @JoinTable({
        name: "tag_children",
        joinColumn: {
            name: "tag_id"
        },
        inverseJoinColumn: {
            name: "child_tag_id"
        }
    })
    @ManyToMany(type => Tag, tag => tag.parents)
    children!: Promise<Tag[]>;

    @ManyToMany(type => Tag, tag => tag.children)
    parents!: Promise<Tag[]>;
    
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

    /**
     * Gets all leaf descendent tag nodes of this tag.
     */
    public getLeafDescendents(): Promise<Map<number, Tag>> {
        return this.traverse((parent: Tag, children: Tag[]) => children.length === 0);
    }

    /**
     * Get all descendent tag nodes of this tag.
     */
    public getDescendents(): Promise<Map<number, Tag>> {
        return this.traverse(() => true);
    }
    
    /**
     * Traverse the tag tree starting at this tag.
     * @param predicate A function to indicate how to continue traversing the tag tree at certain tag nodes.
     */
    public async traverse(predicate: (parent: Tag, children: Tag[]) => boolean|null): Promise<Map<number, Tag>> {
        const map: Map<number, Tag> = new Map();
        const stack: Tag[] = await this.children;
        // Process stack to traverse tag tree
        let tag: Tag|undefined;
        while ((tag = stack.pop()) != null) {
            // Load children of tag
            const children: Tag[] = await tag.children;
            // Invoke the predicate to determine how to continue traversing the tag tree
            const result: boolean|null = predicate(tag, children);
            if (result != null) {
                if (result) {
                    // Add tag to result map
                    map.set(tag.id, tag);
                }
                // Add children to stack
                for (const child of children) {
                    if (!map.has(child.id)) {
                        stack.push(child);
                    }
                }
            }
        }
        return map;
    }
    
    /**
     * Gets the major tag.
     */
    public static findMajor(): Promise<Tag> {
        return this.findOneOrFail({
            where: {
                name: "major"
            }
        });
    }
    
}
