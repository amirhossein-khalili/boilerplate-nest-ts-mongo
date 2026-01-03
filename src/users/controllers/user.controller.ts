import { Body, Controller, Get, Inject, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { IUserService } from '../interfaces';
import { apiDocumentBuilder, SwaggerGet, USER_SERVICE } from '../../common';
import { GetUserDto } from '../dtos';
import { Auth } from '../../auth/utils';

@ApiTags('user')
@ApiBearerAuth()
@Controller('/api/v1/user')
export class UserController {
  constructor(@Inject(USER_SERVICE) private readonly svc: IUserService) {}

  @Get('/lookup')
  @Auth()
  @ApiBody({ schema: apiDocumentBuilder(GetUserDto) })
  @SwaggerGet('return ', false)
  async lookupUser(@Req() req) {
    return this.svc.lookUpUser(req.user);
  }
}
