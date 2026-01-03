import { IsOptional, IsString } from 'class-validator';

export class CheckUserExistDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsString()
  nationalId?: string;
}
