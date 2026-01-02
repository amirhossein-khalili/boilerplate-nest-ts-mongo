// auth.decorator.ts
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../../guards';

export const ROLES_KEY = 'roles';
export function Auth(...roles: string[]) {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
}
