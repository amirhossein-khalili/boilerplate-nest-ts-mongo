// src/modules/file/file.module.ts
import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FileService } from "./files.service";
import { File, FileSchema } from "./schemas/file.schema";
import { MinioModule } from "../minio/minio.module";
import { FilesController } from "./files.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    MinioModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [FilesController],
  providers: [FileService],
  exports: [FileService],
})
export class FilesModule {}
