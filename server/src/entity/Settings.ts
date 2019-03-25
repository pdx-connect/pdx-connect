import {BaseEntity, Column, Entity, PrimaryColumn} from "typeorm";

/**
 * Global application settings.
 */
@Entity("settings")
export class Settings extends BaseEntity {
    
    // @PrimaryColumn({
    //     name: "singleton",
    //     type: "enum",
    //     enum: [""],
    //     collation: "ascii_bin",
    //     comment: "Ensures only one row can exist for the settings table"
    // })
    // readonly singleton: "" = "";
    
    @PrimaryColumn({
        name: "singleton"
    })
    readonly singleton: number = 0;
    
    @Column({
        name: "email_domain",
        type: "varchar",
        length: 255,
        collation: "utf8_unicode_ci",
        comment: "The domain portion of emails used to register"
    })
    emailDomain: string|null = null;
    
    @Column({
        name: "email_domain_unique",
        type: "tinyint",
        width: 1,
        unsigned: true,
        comment: "Whether the email domain does not reuse email addresses"
    })
    emailDomainUnique: boolean = true;
    
}
