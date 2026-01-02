import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Length(11, 11)
  @Expose()
  @ApiProperty({
    description: 'phone number',
    example: '09210848772',
  })
  public phoneNumber: string;

  @IsString()
  @Length(5, 5)
  @Expose()
  @ApiProperty({
    description: 'otp number',
    example: '12345',
  })
  public otp: string;
}
