import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppDataSource } from './app.datasource';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import { FileBusiness, FileInfo } from './entity/FileInfo.entities';

@Module({
  imports: [
    AppDataSource,
    TypeOrmModule.forFeature([FileInfo,FileBusiness])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
