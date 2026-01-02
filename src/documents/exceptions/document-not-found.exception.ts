import { HttpException, HttpStatus } from '@nestjs/common';

export class DocumentNotFoundException extends HttpException {
  constructor(public id: string) {
    super(`document not found ${id}`, HttpStatus.NOT_FOUND);
  }
}
