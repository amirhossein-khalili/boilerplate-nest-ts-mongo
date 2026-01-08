import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateFileDto {
  @ApiProperty({ description: "User ID" })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: "Service ID" })
  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @ApiProperty({ description: "Type of the file" })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ description: "Client ID", required: false })
  @IsString()
  clientId?: string;

  @ApiProperty({ description: "Resource ID", required: false })
  @IsString()
  resourceId?: string;
}
