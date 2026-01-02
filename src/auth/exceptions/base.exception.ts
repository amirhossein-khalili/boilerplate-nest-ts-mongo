import { HttpException } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(public message: string, public statusCode: number) {
    super(message, statusCode);
  }
}
