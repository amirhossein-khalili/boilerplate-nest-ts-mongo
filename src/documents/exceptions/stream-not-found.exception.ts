import { HttpException, HttpStatus } from '@nestjs/common';

export class StreamNotFoundException extends HttpException {
  constructor(public id: string) {
    super(`stream not found ${id}`, HttpStatus.NOT_FOUND);
  }
}
