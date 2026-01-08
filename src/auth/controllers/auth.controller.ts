import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { SwaggerPost } from '../../common';
import { IAuthService } from '../interfaces/auth.service.interface';
import { LoginDto, VerifyOtpDto } from '../dtos';
import { AUTH_SERVICE } from '../utils/constraints';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('/api/v1/auth')
export class AuthController {
  constructor(@Inject(AUTH_SERVICE) private readonly svc: IAuthService) {}

  @Post('/login')
  @ApiBody({ type: LoginDto })
  @SwaggerPost('create new OTP') // Custom Swagger documentation description
  async login(@Body() data: LoginDto) {
    return await this.svc.login(data); // Call AuthService to handle login logic
  }

  // Handle OTP verification and create JWT tokens
  @Post('/login/otp/verify')
  @ApiBody({ type: VerifyOtpDto })
  @SwaggerPost('verify otp, create tokens') // Custom Swagger documentation description
  async verifyOtp(@Body() data: VerifyOtpDto) {
    return await this.svc.verifyOtp(data); // Call AuthService to handle OTP verification and token creation
  }
}
