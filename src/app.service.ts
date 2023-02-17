import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileBusiness, FileInfo } from './entity/FileInfo.entities';
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path';
import { ResData } from './tool/ResData';

import config from './app.config'

const file_business_type_code = config.file_business_type_code.reduce<Map<string, string>>(
  (table, current) => {
    table.set(current[1], current[0])
    return table
  }, new Map()
)

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
    @InjectRepository(FileBusiness)
    private repositoryFileBusiness: Repository<FileBusiness>,
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

    
    if (!fs.existsSync(path.resolve(__dirname, `../files`))) {
      fs.mkdirSync(path.resolve(__dirname, `../files`), { recursive: true })
    }

    fs.writeFileSync(path.resolve(__dirname, `../files/${info.download_id}`), file.buffer)

    await this.repositoryFileInfo.insert(info)

    return info
  }

  async download(id: string) {
    const file_path = path.resolve(__dirname, `../files/${id}`)
    if (!fs.existsSync(file_path)) throw new Error('文件不存在')
    const info = await this.repositoryFileInfo.findOneBy({ id })
    if (!info) throw new Error('文件信息不存在')

    const stream = fs.createReadStream(file_path)

    return { stream, info }
  }

  async link(businessCode: string, fileId: string, businessId: string) {
    const business_type = file_business_type_code.get(businessCode)
    if (!business_type) throw new Error('business type code error!')
    const file_info = await this.repositoryFileInfo.findOneBy({ id: fileId })
    if (!file_info) throw new Error('file is not exist!')

    const business = Object.assign(new FileBusiness(), {
      business_id: businessId, file_info, business_type
    })

    this.repositoryFileBusiness.manager.save(business)

    return file_info
  }

  async unlink(fileId: string, businessId: string) {
    return await this.repositoryFileBusiness.delete({
      business_id: businessId,
      file_info: {
        id: fileId
      }
    })
  }

  async clear() {
    const list = await this.repositoryFileInfo.createQueryBuilder('i')
      .leftJoinAndSelect('i.businesses', 'b')
      .where('b.id is null')
      .getMany()

    await this.repositoryFileInfo.createQueryBuilder('file_info')
      .andWhere('id IN (:...ids)', { ids: list.map(v => v.id) })
      .delete()
      .execute()

    for (const info of list) {
      await new Promise((res) => setTimeout(() => {
        const file_path = path.resolve(__dirname, `../files/${info.download_id}`)
        if (fs.existsSync(file_path)) {
          fs.unlinkSync(file_path)
        }
        res(null)
      }))
    }
  }
}
