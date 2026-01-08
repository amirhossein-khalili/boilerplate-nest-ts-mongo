import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  UseFilters,
  HttpException,
  HttpStatus,
  UseInterceptors,
  Post,
  UploadedFile,
  Body,
} from "@nestjs/common";
import { Response } from "express";
import { FileService } from "./files.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { HttpExceptionFilter } from "../common/filters/http-exception.filter";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { filesSwagger } from "./files.swagger";
import * as AdmZip from "adm-zip";

@ApiTags("files")
@ApiBearerAuth()
@Controller("files")
@UseFilters(HttpExceptionFilter)
export class FilesController {
  constructor(private readonly fileService: FileService) {}

  /**
   * Downloads a file by its object name.
   * @param objectName The name of the object to download.
   * @param res The response object.
   */
  //NOTE :The output file section and its privacy were left for comment. In the future, this section needs many improvements, including each person's access to their own file and the separation of private and public files.
  @Get("download/:objectName")
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @filesSwagger("download/:objectName")
  // @Roles("admin", "operator", "client")
  async downloadFile(
    @Param("objectName") objectName: string,
    @Res() res: Response
  ) {
    try {
      const decodedObjectName = decodeURIComponent(objectName);

      const fileStream = await this.fileService.downloadFile(decodedObjectName);
      const [uuid, originalName] = decodedObjectName.split("_baseStorage_");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${originalName}`
      );
      res.setHeader("Content-Type", "application/octet-stream");

      fileStream.on("error", (error) => {
        res.end();
        throw new HttpException("File not found", HttpStatus.NOT_FOUND);
      });

      return fileStream.pipe(res);
    } catch (error) {
      throw new HttpException("File not found", HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Downloads multiple files as a zip by object names.
   * @param objectNames Array of object names to download.
   * @param res The response object.
   */

  /**
    Downloads multiple files as a zip by object names.
    @param objectNames Array of object names to download.
    @param res The response object.
   */
  @Post("downloadBatch")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "operator", "client")
  @filesSwagger("downloadBatch")
  async downloadBatch(
    @Body("objectNames") objectNames: string[],
    @Res() res: Response
  ) {
    try {
      const zip = new AdmZip();

      for (const objectName of objectNames) {
        const decodedObjectName = decodeURIComponent(objectName);
        const fileStream = await this.fileService.downloadFile(
          decodedObjectName
        );
        const fileBuffer = await this.streamToBuffer(fileStream);

        const [uuid, originalName] = decodedObjectName.split("_baseStorage_");
        zip.addFile(originalName, fileBuffer);
      }

      const zipBuffer = zip.toBuffer();
      res.setHeader("Content-Disposition", `attachment; filename=files.zip`);
      res.setHeader("Content-Type", "application/zip");
      res.send(zipBuffer);
    } catch (error) {
      throw new HttpException(
        "Batch file download failed",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });
  }

  @ApiBearerAuth()
  @Post("upload")
  @filesSwagger("upload")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "operator", "client")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      const result = await this.fileService.uploadSimpleFile(file);
      return {
        message: "فایل با موفقیت آپلود شد",
        data: { objectName: result.objectName },
      };
    } catch (error) {
      throw new HttpException("File upload failed", HttpStatus.BAD_REQUEST);
    }
  }
}
