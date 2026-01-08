import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MinioService } from "../minio/minio.service";
import { File, FileDocument } from "./schemas/file.schema";
import { CreateFileDto } from "./dto/create-file.dto";
import { v4 as uuidv4 } from "uuid";
import { BufferedFile } from "src/common/interfaces/file.interface";
import { FilesInterceptor } from "@nestjs/platform-express";

@Injectable()
export class FileService {
  private readonly delimiter = "_baseStorage_";
  constructor(
    private readonly minioService: MinioService,
    @InjectModel(File.name) private readonly fileModel: Model<FileDocument>
  ) {}

  private sanitizeFilename(filename: string): string {
    return filename.replace(new RegExp(this.delimiter, "g"), "_");
  }

  async uploadSimpleFile(file: BufferedFile): Promise<{ objectName: string }> {
    const sanitizedFilename = this.sanitizeFilename(file.originalname);
    const objectName = `${uuidv4()}${this.delimiter}${sanitizedFilename}`;
    await this.minioService.uploadFile(objectName, file);
    return { objectName };
  }

  async deleteFile(objectName: string) {
    await this.minioService.deleteFile(objectName);
    return this.fileModel.deleteOne({ objectName }).exec();
  }

  async downloadFile(objectName: string) {
    return await this.minioService.downloadFile(objectName);
  }

  /**
   * Uploads a file related to a client and resource.
   * @param clientId - ID of the client.
   * @param resourceId - ID of the resource.
   * @param file - Buffered file to be uploaded.
   * @returns The uploaded file document.
   */
  async uploadClientResourceFile(
    clientId: string,
    resourceId: string,
    file: BufferedFile
  ): Promise<File> {
    const sanitizedFilename = this.sanitizeFilename(file.originalname);
    const objectName = `${uuidv4()}${this.delimiter}${sanitizedFilename}`;
    await this.minioService.uploadFile(objectName, file);

    const newFile = new this.fileModel({
      objectName,
      originalName: file.originalname,
      clientId,
      resourceId,
      type: "clientResource",
    });

    return newFile.save();
  }

  /**
   * Uploads a file related to a client and resource.
   * @param clientId - ID of the client.
   * @param file - Buffered file to be uploaded.
   * @returns The uploaded file document.
   */
  async uploadClientFile(clientId: string, file: BufferedFile): Promise<File> {
    const sanitizedFilename = this.sanitizeFilename(file.originalname);
    const objectName = `${uuidv4()}${this.delimiter}${sanitizedFilename}`;
    await this.minioService.uploadFile(objectName, file);

    const newFile = new this.fileModel({
      objectName,
      originalName: file.originalname,
      clientId,
      type: "client",
    });

    return newFile.save();
  }

  /**
   * Retrieves a presigned URL for a file stored in MinIO.
   * @param objectName - Name of the object (file) in MinIO.
   * @returns Presigned URL to access the file.
   */
  async getFileUrl(objectName: string): Promise<string> {
    return this.minioService.getFileUrl(objectName);
  }

  /**
   * Converts the file buffer to Base64 and uploads it to MinIO.
   * @param file - BufferedFile object containing the file buffer.
   * @returns The object name in MinIO.
   */
  async uploadFileAsBase64(
    file: BufferedFile
  ): Promise<{ objectName: string }> {
    const sanitizedFilename = this.sanitizeFilename(file.originalname);
    const objectName = `${uuidv4()}${this.delimiter}${sanitizedFilename}`;

    // Convert file buffer to Base64
    const base64Content = file.buffer.toString("base64");
    const base64Buffer = Buffer.from(base64Content, "utf-8"); // Create a buffer from Base64 string

    // Upload the Base64-encoded file to MinIO
    await this.minioService.uploadBase64File(objectName, base64Buffer);
    return { objectName };
  }

  /**
   * Convert file buffer to Base64 string.
   * @param file - BufferedFile object containing the file buffer.
   * @returns Base64 encoded string.
   */
  async convertFileToBase64(file: BufferedFile): Promise<string> {
    const base64String = file.buffer.toString("base64"); // Convert file buffer to Base64
    return base64String;
  }
}
