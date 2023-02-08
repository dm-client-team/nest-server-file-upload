import { Body, Controller, Get, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AppService, FileInput } from './app.service';
import { Response } from 'express'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/upload')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
  ]))
  async uploadFile(
    @UploadedFiles() upload: { file: FileInput[] },
    @Body() payload: { name: string }
  ) {

    const file = upload.file[0]
    const name = payload.name

    if ((!file || !name)) throw new Error('上传参数错误')

    Object.assign(file, { originalname: name })

    return this.appService.upload(file)
  }

  @Get('/download/:id')
  async downloadFile(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    const { stream, info } = await this.appService.download(id)
    res.setHeader('Content-Disposition', `attachment; filename="${info.name}"`)
    stream.pipe(res)
  }
}
