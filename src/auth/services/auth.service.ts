import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { IUserRepository, USER_REPOSITORY } from '../../users/interfaces';
import { IAuthService } from '../interfaces';
import { LoginDto, VerifyOtpDto } from '../dtos';
import { v4 as uuidv4 } from 'uuid';
import generateOTP from '../utils/generate-otp.utils';
import { UserNotFoundException } from '../exceptions';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    protected readonly repository: IUserRepository,
    private jwt: JwtService,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  // Handle login logic
  async login(data: LoginDto): Promise<any> {
    let user = await this.repository.findByphone(data.phone);
    if (!user) {
      user = await this.repository.create({
        id: uuidv4(),
        phone: data.phone,
        password: '', // No password for this OTP-based login
      });
    }

    const rateLimitKey = `otp:limit:${data.phone}`;
    const otpKey = `otp:code:${data.phone}`;

    // Check if OTP has already been sent recently
    const isLimited = await this.redis.get(rateLimitKey);
    if (isLimited) {
      throw new BadRequestException(
        'OTP already sent. Please wait before retrying.',
      );
    }

    // Generate OTP
    const otp = generateOTP(5);

    // Store OTP in Redis with expiration time
    await this.redis.set(otpKey, otp, 'EX', 180); // OTP expires after 3 minutes
    await this.redis.set(rateLimitKey, '1', 'EX', 120); // Limit retries to once every 2 minutes

    return otp; // Return OTP to client (for verification)
  }

  // Verify OTP and generate JWT tokens
  async verifyOtp(
    data: VerifyOtpDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const otpKey = `otp:code:${data.phone}`;
    const savedOtp = await this.redis.get(otpKey);

    if (!savedOtp) throw new BadRequestException('OTP expired or invalid.');
    if (savedOtp !== data.otp) throw new BadRequestException('Invalid OTP.');

    // Clear OTP after successful verification
    await this.redis.del(otpKey);

    const user = await this.repository.findByphone(data.phone);
    if (!user) throw new UserNotFoundException(data.phone);

    const payload = {
      sub: user._id,
      phone: user.phone,
      // role: user.role  // Uncomment if roles are implemented for the user
    };

    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });

    const refreshKey = `refresh:${user._id}`;
    await this.redis.set(refreshKey, refreshToken, 'EX', 7 * 24 * 60 * 60); // Store refresh token for 7 days

    return { accessToken, refreshToken };
  }

  // Handle refresh token logic
  async refreshToken(
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwt.verify(oldRefreshToken);
      const refreshKey = `refresh:${payload.sub}`;
      const savedToken = await this.redis.get(refreshKey);

      if (savedToken !== oldRefreshToken) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      const newAccessToken = this.jwt.sign(
        { sub: payload.sub, phone: payload.phone },
        { expiresIn: '15m' },
      );
      const newRefreshToken = this.jwt.sign(
        { sub: payload.sub, phone: payload.phone },
        { expiresIn: '7d' },
      );

      await this.redis.set(refreshKey, newRefreshToken, 'EX', 7 * 24 * 60 * 60);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid token.');
    }
  }
}
