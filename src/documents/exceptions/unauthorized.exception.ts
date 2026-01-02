import { HttpException, HttpStatus } from '@nestjs/common';

export class UnauthorizedException extends HttpException {
  constructor(public msg: string) {
    super(msg, HttpStatus.UNAUTHORIZED);
  }
}
