import { IsString, MaxLength, MinLength } from 'class-validator';

export class FindUserByPhoneDto {
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  phone: string;
}

export class FindUserByUserNameDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  userName: string;
}
