import { Injectable, PipeTransform, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Multer from "multer";

@Injectable()
export class FilesValidationPipe implements PipeTransform {
  private readonly maxFileSize: number;
  private readonly magicNumbers: Record<string, string>;
  private readonly fileNameRegex = /^[a-zA-Z0-9_.-]+$/;

  constructor(private readonly configService: ConfigService) {
    this.maxFileSize = this.configService.get<number>("maxFileSize");

    const magicNumbersString = this.configService.get<string>(
      "allowedMagicNumbers"
    );
    this.magicNumbers = magicNumbersString
      ? magicNumbersString.split(",").reduce((acc, entry) => {
          const [ext, magic] = entry.split(":");
          acc[ext] = magic;
          return acc;
        }, {})
      : {};
  }

  private getMagicNumber(buffer: Buffer, length: number): string {
    return buffer.slice(0, length).toString("hex").toLowerCase();
  }

  private validateMagicNumber(file: Express.Multer.File): boolean {
    const extension = file.originalname.split(".").pop().toLowerCase();
    const expectedMagicNumber = this.magicNumbers[extension];
    if (!expectedMagicNumber) {
      return false;
    }
    const actualMagicNumber = this.getMagicNumber(
      file.buffer,
      expectedMagicNumber.length / 2
    );
    return actualMagicNumber.startsWith(expectedMagicNumber);
  }

  private validateFileName(fileName: string): boolean {
    return this.fileNameRegex.test(fileName);
  }

  async transform(files: Express.Multer.File[]) {
    if (files.length === 0) {
      throw new BadRequestException("No files provided for upload");
    }

    const errors: string[] = [];
    const allowedFileTypes = Object.keys(this.magicNumbers).join(", ");

    for (const file of files) {
      if (file.size > this.maxFileSize) {
        errors.push(
          `The file "${
            file.originalname
          }" is too large. Maximum allowed size is ${
            this.maxFileSize / 1024 / 1024
          } MB.`
        );
      }

      if (!this.validateMagicNumber(file)) {
        errors.push(
          `فایل دارای یک نوع فایل پشتیبانی نشده یا نامعتبر است. انواع فایل های مجاز عبارتند از:  ${allowedFileTypes}.`
        );
      }

      if (!this.validateFileName(file.originalname)) {
        errors.push("INVALID_FILE_NAME");
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join(" "));
    }

    return files;
  }
}
