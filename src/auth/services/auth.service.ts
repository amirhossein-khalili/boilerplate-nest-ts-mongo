// auth.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { IUserRepository } from 'src/users/interfaces';
import { USER_REPOSITORY } from 'src/common';
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

  async login(data: LoginDto): Promise<any> {
    let user = await this.repository.findByPhoneNumber(data.phoneNumber);
    if (!user) {
      user = await this.repository.create({
        id: uuidv4(),
        phoneNumber: data.phoneNumber,
      });
    }
    const rateLimitKey = `otp:limit:${data.phoneNumber}`;
    const otpKey = `otp:code:${data.phoneNumber}`;

    const isLimited = await this.redis.get(rateLimitKey);
    if (isLimited) {
      throw new BadRequestException(
        'OTP already sent. Please wait before retrying.',
      );
    }

    const otp = generateOTP(5);

    await this.redis.set(otpKey, otp, 'EX', 180);

    await this.redis.set(rateLimitKey, '1', 'EX', 120);

    return otp;
  }

  async verifyOtp(
    data: VerifyOtpDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const otpKey = `otp:code:${data.phoneNumber}`;
    const savedOtp = await this.redis.get(otpKey);

    if (!savedOtp) throw new BadRequestException('OTP expired or invalid.');
    if (savedOtp !== data.otp) throw new BadRequestException('Invalid OTP.');

    await this.redis.del(otpKey);

    const user = await this.repository.findByPhoneNumber(data.phoneNumber);

    if (!user) throw new UserNotFoundException(data.phoneNumber);

    const payload = {
      sub: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });

    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });

    const refreshKey = `refresh:${user._id}`;
    await this.redis.set(refreshKey, refreshToken, 'EX', 7 * 24 * 60 * 60);

    return { accessToken, refreshToken };
  }

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
        { sub: payload.sub, phoneNumber: payload.phoneNumber },
        { expiresIn: '15m' },
      );
      const newRefreshToken = this.jwt.sign(
        { sub: payload.sub, phoneNumber: payload.phoneNumber },
        { expiresIn: '7d' },
      );

      await this.redis.set(refreshKey, newRefreshToken, 'EX', 7 * 24 * 60 * 60);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid token.');
    }
  }
}
