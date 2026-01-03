import { Body, Controller, Get, Inject, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { IUserService, USER_SERVICE } from '../interfaces';
import { apiDocumentBuilder, SwaggerGet } from '../../common';
import { GetUserDto } from '../dtos';
import { Auth } from '../../auth/utils';

@ApiTags('user')
@ApiBearerAuth()
@Controller('/api/v1/user')
export class UserController {
  constructor(@Inject(USER_SERVICE) private readonly svc: IUserService) {}
}
