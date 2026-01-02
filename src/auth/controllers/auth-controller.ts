import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { SwaggerPost } from '../../common';
import { IAuthService } from '../interfaces/auth.service.interface';
import { LoginDto, VerifyOtpDto } from '../dtos';
import { AUTH_SERVICE } from '../common/constraints';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('/api/v1/auth')
export class AuthController {
  constructor(@Inject(AUTH_SERVICE) private readonly svc: IAuthService) {}

  @Post('/login')
  @ApiBody({ type: LoginDto })
  @SwaggerPost('create new OTP')
  async login(@Body() data: LoginDto) {
    return await this.svc.login(data);
  }

  @Post('/login/otp/verify')
  @ApiBody({ type: VerifyOtpDto })
  @SwaggerPost('verify otp , create tokens')
  async verifyOtp(@Body() data: VerifyOtpDto) {
    return await this.svc.verifyOtp(data);
  }
}
