import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UploadClientResourceFileDto {
  @ApiProperty({
    description: "The ID of the client uploading the file",
    example: "60d5ec49f73d2a001c8f8c8b",
  })
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @ApiProperty({
    description: "The ID of the resource the file is related to",
    example: "60d5ec49f73d2a001c8f8c8b",
  })
  @IsNotEmpty()
  @IsString()
  resourceId: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    description: "The file to be uploaded",
  })
  file: any;
}
