import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(11, 11)
  @Expose()
  @ApiProperty({
    description: 'phone number',
    example: '09210848772',
  })
  public phoneNumber: string;
}
