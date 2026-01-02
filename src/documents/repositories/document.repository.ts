import { Stream } from 'stream';
import { Types, Connection, mongo } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { IDocumentRepository } from '../interfaces/document.repository.interface';
import { Document } from '../models/document.entity';

@Injectable()
export class DocumentRepository implements IDocumentRepository, OnModuleInit {
  private readonly bucket: mongo.GridFSBucket;

  constructor(@InjectConnection() protected readonly connection: Connection) {
    this.bucket = new mongo.GridFSBucket(this.connection.db);
  }
  async onModuleInit() {
    await this.connection.collection('fs.files').createIndex(
      {
        'metadata.domain': 1,
      },
      {
        unique: false,
        background: true,
      },
    );
  }

  async create(document: Document): Promise<string> {
    const { contentType, filename, metadata, stream } = document;
    const uploadStream = this.bucket.openUploadStream(filename, {
      metadata,
      contentType,
    });
    const fileId = new Promise<string>((resolve, reject) => {
      const events = new Map();
      uploadStream
        .on('error', (error) => reject(error))
        .on('close', () => {
          events.set('close', null);
          if (events.has('finish')) {
            resolve(uploadStream.id.toString());
          } else {
            reject(new Error('socket broken'));
          }
        })
        .on('finish', () => {
          events.set('finish', null);
          if (events.has('close')) {
            resolve(uploadStream.id.toString());
          }
        });
    });
    stream.pipe(uploadStream);
    const id = await fileId;
    uploadStream.removeAllListeners();
    return id;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.connection
      .collection('fs.files')
      .deleteOne({ _id: new Types.ObjectId(id) });
    return result.deletedCount === 1;
  }

  async getInfo(ids: string[]): Promise<any> {
    type InfosType = (mongo.GridFSFile & { filesize?: number })[];
    try {
      const infos: InfosType = await this.bucket
        .find({
          _id: {
            $in: ids.map((id) => new Types.ObjectId(id)),
          },
        })
        .toArray();
      for (const info of infos) {
        info.filesize = info.length;
        delete info.length;
        delete info.chunkSize;
      }
      return infos;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  getStream(id: string): Stream {
    return this.bucket.openDownloadStream(new Types.ObjectId(id));
  }
}
