import { Stream } from 'stream';

export interface CreateDto {
  contentType: string;
  filename: string;
  stream: Stream;
  userId?: string;
  fileSize: number;
  domain: string;
}
