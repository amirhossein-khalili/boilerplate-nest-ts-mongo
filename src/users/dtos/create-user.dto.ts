import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  @Expose()
  @ApiProperty({
    description: 'create id',
    example: '6ffaf78d-a6f6-4b45-a378-71c4d732a36f',
  })
  public id: string;

  @IsString()
  @Expose()
  @ApiProperty({
    description: 'user phone number',
    example: '09210848772',
  })
  public phoneNumber: string;
}
