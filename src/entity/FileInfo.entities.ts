import { Entity, PrimaryColumn, Column } from "typeorm"

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
}