import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(public id: string) {
    super(`user not found ${id}`, HttpStatus.NOT_FOUND);
  }
}
