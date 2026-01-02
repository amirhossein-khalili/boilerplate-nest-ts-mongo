import { HttpException, HttpStatus } from '@nestjs/common';

export class MetaNotProvidedException extends HttpException {
  constructor(public id: string) {
    super(`meta not provided`, HttpStatus.BAD_REQUEST);
  }
}
