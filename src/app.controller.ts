import { Body, Controller, Get, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AppService, FileInput } from './app.service';
import { Response } from 'express'
import { ResData } from './tool/ResData';
import { ApiBody, ApiConsumes, ApiParam } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: "string" },
        file: { type: 'string', format: 'binary' }
      }
    }
  })
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

    return ResData.success(await this.appService.upload(file))
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

  @Post('/link/:file_id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type_code: { type: 'string' },
        business_id: { type: 'string' }
      }
    }
  })
  async linkBusiness(
    @Param('file_id') file_id: string,
    @Body() payload: { type_code: string, business_id: string }
  ) {
    const { type_code, business_id } = payload

    if (!business_id) throw new Error('need business id!')

    return ResData.success(await this.appService.link(type_code, file_id, business_id))
  }

  @Post('/unlink/:file_id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        business_id: { type: 'string' }
      }
    }
  })
  async unlinkBusiness(
    @Param('file_id') file_id: string,
    @Body() payload: { business_id: string }
  ) {
    const { business_id } = payload

    if (!business_id) throw new Error('need business id!')

    return ResData.success(await this.appService.unlink(file_id, business_id))
  }

  @Post('/cache/clear')
  async clear() {
    return ResData.success(await this.appService.clear())
  }
}
