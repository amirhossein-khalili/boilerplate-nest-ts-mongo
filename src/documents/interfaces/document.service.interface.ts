import { CreateDto } from '../dtos/create.dto';
import { Document } from '../models/document.entity';
import { GetDocumentDto } from '../dtos';
import { IUserMeta } from '../../common/interfaces';

export interface IDocumentService {
  create(data: CreateDto, userMeta: IUserMeta): Promise<any>;
  getDocument(
    documentDownloadDto: GetDocumentDto,
    userMeta: IUserMeta,
  ): Promise<Document>;
}
