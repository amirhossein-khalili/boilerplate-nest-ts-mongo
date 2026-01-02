import {
  Controller,
  Get,
  HttpException,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { IDocumentService } from '../interfaces/document.service.interface';
import { SwaggerGet, SwaggerPost } from 'src/common';
import Busboy from 'busboy';
import { Response } from 'express';
import * as events from 'node:events';
import { ParamEx as Param } from '../../common';
import { Auth } from '../../auth/utils';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('/api/v1/document')
export class DocumentController {
  constructor(
    @Inject('IDocumentService')
    private readonly documentsService: IDocumentService,
  ) {}

  @Post()
  @Auth()
  @SwaggerPost('upload document.')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        domain: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async saveDocument(@Req() req, @Res() res: Response) {
    if (!req.header('Content-Type'))
      throw new HttpException('Content-Type is required.', 400);

    if (!req.header('X-Domain'))
      throw new HttpException('X-Domain is required.', 400);
    const eventEmitter = new events.EventEmitter();
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: +process.env.MAX_FILE_SIZE_UPLOAD || 31457280,
      },
      defParamCharset: 'utf8',
    });
    busboy.on('file', async (name, file, info) => {
      try {
        const response = await this.documentsService.create(
          {
            contentType: info.mimeType,
            filename: info.filename,
            stream: file,
            fileSize: +req.header('Content-Length') || 0,
            domain: req.header('X-Domain'),
          },
          req.user,
        );
        eventEmitter.emit('upload', 'file', response);
      } catch (e) {
        eventEmitter.emit('upload', 'error', e);
      }
    });
    busboy.on('error', (e) => eventEmitter.emit('upload', 'error', e));
    busboy.on('finish', () => eventEmitter.emit('upload', 'finish'));
    busboy.on('close', () => eventEmitter.emit('upload', 'close'));
    req.pipe(busboy);
    const flow = new Map();
    eventEmitter.on('upload', (name, value) => {
      flow.set(name, value);
      if (
        name === 'error' ||
        (name === 'close' && !flow.has('file') && !flow.has('finish'))
      ) {
        eventEmitter.removeAllListeners();
        busboy.removeAllListeners();
        if (name === 'error') throw new HttpException('socket error', 500);
      }
      if (
        (name === 'file' && flow.has('finish')) ||
        (name === 'finish' && flow.has('file'))
      ) {
        eventEmitter.removeAllListeners();
        busboy.removeAllListeners();
        res.header('Connection', 'close');
        res.status(201).json(value || flow.get('file'));
      }
    });
  }

  @Get(':id')
  @Auth()
  @SwaggerGet('get a document', false)
  async getDocument(@Param('id') id: string, @Res() res: any, @Req() req: any) {
    try {
      const document = await this.documentsService.getDocument(
        { id },
        req.user,
      );
      res.header('Content-Type', document.contentType);
      return document.stream.pipe(res);
    } catch (e) {
      console.log(e);
      return res.sendStatus(500);
    }
  }

  // /**
  //  * CAUTION!
  //  * DO NOT EXPOSE IN GATEWAY.
  //  */
  // @Delete(':id')
  // @SwaggerDelete('delete a document', false)
  // async deleteDocument(
  //   @Param('id') id: string,
  //   @Headers('X-Metadata') metadata: any,
  // ) {
  //   try {
  //     return await this.documentsService.deleteDocument(
  //       { id },
  //       JSON.parse(metadata),
  //     );
  //   } catch (e) {
  //     return {
  //       success: false,
  //       data: { id },
  //       meta: {
  //         ...JSON.parse(metadata),
  //         messages: [
  //           {
  //             level: 'error',
  //             service: 'com.chargoon.cloud.svc.documents',
  //             domain: 'documents',
  //             context: 'deleteDocument',
  //             exception: e,
  //             message: e?.message || e,
  //           },
  //         ],
  //         exception: e?.message || e,
  //       },
  //     };
  //   }
  // }

  // @Get('download/:id')
  // @SwaggerGet('download a document', false)
  // async downloadDocument(
  //   @Param('id') id: string,
  //   @Headers('X-Metadata') metadata: any,
  //   @Res() res: any,
  // ) {
  //   try {
  //     const document = await this.documentsService.getDocument(
  //       { id },
  //       JSON.parse(metadata),
  //     );
  //     res.header('Content-Type', document.contentType);
  //     res.header(
  //       'Content-Disposition',
  //       `attachment; filename=${document.filename}`,
  //     );
  //     return document.stream.pipe(res);
  //   } catch (e) {
  //     return handleErrorResponse(e, res, 'downloadDocument', this.logger);
  //   }
  // }

  // @Get('multi/:ids')
  // @SwaggerGet('get many documents as base64', false)
  // async getMultiDocument(
  //   @Param('ids') ids: string,
  //   @Headers('X-Metadata') metadata: any,
  // ) {
  //   const arrayOfId: string[] = ids.split(',');
  //   return this.documentsService.gatMultiDocumentAsBase64(
  //     { ids: arrayOfId },
  //     JSON.parse(metadata),
  //   );
  // }

  // @RpcQuery('documents', 'documents', 'get_used_space_size')
  // @UseInterceptors(new RpcValidator(OrganizationSpaceSizeDto))
  // async getUsedSpaceSize(
  //   @Param() data: OrganizationSpaceSizeDto,
  //   @Headers() headers: any,
  // ) {
  //   const { __meta, ...d } = data;
  //   return this.documentsService.getUsedSpaceSize(
  //     d,
  //     await this.getMetadata(data, headers),
  //   );
  // }

  // @Get('organizations/:organizationId')
  // @SwaggerGet('get an organization documents', false)
  // @RpcQuery('documents', 'documents', 'get_organization_documents')
  // @UseInterceptors(
  //   new RpcValidator(GetOrganizationDocumentsDto),
  //   AuthzInterceptor,
  // )
  // @ApiQuery({
  //   name: 'domain',
  //   type: String,
  //   required: false,
  //   example: 'correspondence',
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   type: Number,
  //   required: false,
  //   example: 10,
  // })
  // @ApiQuery({
  //   name: 'offset',
  //   type: Number,
  //   required: false,
  //   example: 0,
  // })
  // async getOrganizationDocuments(
  //   @Param() data: GetOrganizationDocumentsDto,
  //   @Headers() headers: any,
  //   @Req() req: any,
  // ) {
  //   const { __meta, ...d } = data;
  //   return this.documentsService.getOrganizationDocuments(
  //     d,
  //     await this.getMetadata(data, headers, req, { pagination: true }),
  //   );
  // }
}
