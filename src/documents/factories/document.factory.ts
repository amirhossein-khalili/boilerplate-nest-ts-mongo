import { IUserMeta } from '../../common/interfaces';
import { CreateDto } from '../dtos/create.dto';
import { Document } from '../models/document.entity';

export class DocumentFactory {
  public static createDocument(
    documentDTO: CreateDto,
    userMeta?: IUserMeta,
  ): Document {
    const document = new Document();
    document.contentType = documentDTO.contentType;
    document.filename = documentDTO.filename;
    document.metadata = {
      userId: userMeta.id,
      domain: documentDTO.domain,
    };
    document.stream = documentDTO.stream;
    return document;
  }
}
