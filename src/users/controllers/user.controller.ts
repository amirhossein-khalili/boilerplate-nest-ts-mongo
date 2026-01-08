import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { IUserService, USER_SERVICE } from '../interfaces';
import { CreateUserDto } from '../dtos';
import { UserNotFoundException } from '../exceptions';
import { BaseController } from '../../common';

@ApiTags('user')
@ApiBearerAuth()
@Controller('/api/v1/user')
export class UserController extends BaseController {
  constructor(@Inject(USER_SERVICE) private readonly svc: IUserService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() data: CreateUserDto, @Req() req: any) {
    return this.svc.createUser(data, this.generateMetaData(req));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Param('id') id: string, @Req() req: any) {
    const user = await this.svc.getUserById({ id }, this.generateMetaData(req));
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }
}
