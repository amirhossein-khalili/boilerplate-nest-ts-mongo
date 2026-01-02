import { Body, Controller, Get, Inject, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { IUserService } from '../interfaces';
import { apiDocumentBuilder, SwaggerGet, USER_SERVICE } from '../../common';
import { ParamEx as Param } from '../../common';
import { GetUserDto } from '../dtos';
import { Auth } from '../../auth/utils';

@ApiTags('user')
@ApiBearerAuth()
@Controller('/api/v1/user')
export class UserController {
  constructor(@Inject(USER_SERVICE) private readonly svc: IUserService) {}

  // @Get('/test')
  // @ApiQuery({ name: 'limit', type: Number, required: false })
  // @ApiQuery({ name: 'offset', type: Number, required: false })
  // @ApiQuery({ name: 'isDone', type: Boolean, required: false })
  // @ApiQuery({ name: 'status', type: String, required: false })
  // @ApiQuery({
  //   name: 'from',
  //   type: Date,
  //   description: 'from date',
  //   example: '2024-12-10T16:42:14Z',
  //   required: false,
  // })
  // @ApiQuery({
  //   name: 'to',
  //   type: Date,
  //   description: 'to date',
  //   example: '2024-12-10T16:42:14Z',
  //   required: false,
  // })
  // @ApiBody({ schema: apiDocumentBuilder(GetDto) })
  // @SwaggerGet('return ', false)
  // async getAllTasks(@Param() data: GetDto) {
  //   return this.svc.get(data);
  // }

  @Get('/lookup')
  @Auth()
  @ApiBody({ schema: apiDocumentBuilder(GetUserDto) })
  @SwaggerGet('return ', false)
  async lookupUser(@Req() req) {
    return this.svc.lookUpUser(req.user);
  }
}
