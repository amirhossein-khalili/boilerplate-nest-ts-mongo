import Stream from 'node:stream';
import { Document } from '../models/document.entity';

export interface IDocumentRepository {
  create(data: Document): Promise<any>;
  getInfo(id: string[]): Promise<any>;
  getStream(id: string): Stream;
}
