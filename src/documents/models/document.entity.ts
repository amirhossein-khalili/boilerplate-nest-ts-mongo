import { Stream } from 'stream';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument } from 'mongoose';

export class Document {
  contentType: string;

  filename: string;

  metadata: {
    userId?: string;
    domain: string;
  };

  stream: Stream;

  base64?: string;

  filesize?: number;
}

export type DocumentMongo = DocumentEntity & MongooseDocument;

@Schema({ collection: 'documents', timestamps: true })
export class DocumentEntity {
  @Prop({ required: true })
  contentType: string;

  @Prop({ required: true })
  filename: string;

  @Prop({
    type: {
      userId: { type: String, required: false },
      domain: { type: String, required: true },
    },
  })
  metadata: {
    userId?: string;
    domain: string;
  };

  // ❗ MongoDB cannot store Node.js Stream, use Buffer instead OR GridFS
  @Prop({ type: Buffer, required: false })
  stream?: Buffer;

  @Prop({ required: false })
  base64?: string;

  @Prop({ required: false })
  filesize?: number;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentEntity);
