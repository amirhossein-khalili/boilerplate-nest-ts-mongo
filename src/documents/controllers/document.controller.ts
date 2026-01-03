import {
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
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
}
