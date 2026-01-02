import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class GetUserDto {
  @IsUUID()
  @Expose()
  @ApiProperty({
    description: 'user id',
    example: '6ffaf78d-a6f6-4b45-a378-71c4d732a36f',
  })
  public id: string;
}
