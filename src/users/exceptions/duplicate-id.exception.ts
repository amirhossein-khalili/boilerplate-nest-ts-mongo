import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateIdException extends HttpException {
  constructor(public id: string) {
    super(`duplicate id ${id}`, HttpStatus.CONFLICT);
  }
}
