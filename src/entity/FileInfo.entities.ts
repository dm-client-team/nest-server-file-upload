import { Entity, PrimaryColumn, Column, OneToMany, ManyToOne } from "typeorm"
import * as crypto from 'crypto'

@Entity()
export class FileInfo {
    @PrimaryColumn({ length: 50 })
    id: string

    @Column({ length: 50 })
    download_id: string

    @Column({ length: 50 })
    name: string

    @Column()
    size: number

    @Column({ length: 50 })
    hash: string

    @Column({ length: 50 })
    mimetype: string

    @Column({ length: 50 })
    encoding: string

    @Column({ type: 'datetime' })
    create_time: Date = new Date()

    @Column({ type: 'datetime' })
    update_time: Date = new Date()

    @OneToMany(() => FileBusiness, business => business.file_info)
    businesses: FileBusiness[];

}

@Entity()
export class FileBusiness {

    @PrimaryColumn({ length: 50 })
    id: string = crypto.randomUUID()

    @Column({ length: 50 })
    business_id: string

    @ManyToOne(() => FileInfo, info => info.businesses)
    file_info: FileInfo

    @Column({ length: 50 })
    business_type: string

    @Column({ type: 'datetime' })
    create_time: Date = new Date()

    @Column({ type: 'datetime' })
    update_time: Date = new Date()
}