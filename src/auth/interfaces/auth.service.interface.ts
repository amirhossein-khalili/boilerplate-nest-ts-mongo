import { LoginDto, VerifyOtpDto } from '../dtos';

export interface IAuthService {
  login(data: LoginDto): Promise<any>;
  verifyOtp(data: VerifyOtpDto): Promise<any>;
  refreshToken(
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }>;
}
