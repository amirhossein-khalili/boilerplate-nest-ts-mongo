import { HttpException, HttpStatus } from '@nestjs/common';

export class AccessDeniedException extends HttpException {
  constructor(action: string, userId?: string) {
    super(`access denied on action: ${action} for user ${userId}`, HttpStatus.BAD_REQUEST);
  }
}
