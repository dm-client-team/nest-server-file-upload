// import { DataSource } from 'typeorm'
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileInfo, FileBusiness } from './entity/FileInfo.entities'

export const AppDataSource = TypeOrmModule.forRoot({
    type: "better-sqlite3",
    database: "./sqlite/main.sqlite",
    synchronize: true,
    logging: true,
    entities: [FileInfo, FileBusiness],
    subscribers: [],
    migrations: [],
})