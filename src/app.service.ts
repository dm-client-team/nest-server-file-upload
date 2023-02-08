import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileInfo } from './entity/FileInfo.entities';
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path';
import { ResData } from './tool/ResData';

export type FileInput = {
  size: number,
  buffer: Buffer
  originalname: string,
  encoding: string,
  mimetype: string,
}


@Injectable()
export class AppService {
  constructor(
    @InjectRepository(FileInfo)
    private repositoryFileInfo: Repository<FileInfo>,
  ) { }

  getHello(): string {
    return 'Hello World!';
  }

  async upload(file: FileInput) {
    console.log(file)

    const id = crypto.randomUUID()

    const res = await this.repositoryFileInfo.findOneBy({ id })

    if (res) throw new Error('id 重复!')

    const hash_tool = crypto.createHash('md5');
    const info = new FileInfo()

    hash_tool.update.bind(file.buffer)

    info.id = id
    info.download_id = id
    info.hash = hash_tool.digest('hex')
    info.name = file.originalname
    info.mimetype = file.mimetype
    info.encoding = file.encoding
    info.size = file.size

    fs.writeFileSync(path.resolve(__dirname, `../files/${info.id}`), file.buffer)

    await this.repositoryFileInfo.insert(info)

    return ResData.success(info)
  }

  async download(id: string) {
    const file_path = path.resolve(__dirname, `../files/${id}`)
    if (!fs.existsSync(file_path)) throw new Error('文件不存在')
    const info = await this.repositoryFileInfo.findOneBy({ id })
    if (!info) throw new Error('文件信息不存在')

    const stream = fs.createReadStream(file_path)

    return { stream, info }
  }

  async link(fileId:string){}

  async clear(){}
}
