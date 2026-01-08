import {
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import { applyDecorators } from "@nestjs/common";

export function filesSwagger(
  method: "upload" | "download/:objectName" | "downloadBatch"
) {
  switch (method) {
    case "upload":
      return applyDecorators(
        ApiOperation({
          summary: "Upload file",
          description: "Uploads a new file to the server",
        }),
        ApiResponse({ status: 201, description: "File uploaded successfully" }),
        ApiResponse({ status: 400, description: "Bad request" })
      );

    case "downloadBatch":
      return applyDecorators(
        ApiOperation({
          summary: "Batch download files as a zip",
          description:
            "Downloads multiple files as a single zip file using an array of object names.",
        }),
        ApiBody({
          schema: {
            type: "object",
            properties: {
              objectNames: {
                type: "array",
                items: { type: "string" },
                example: [
                  "file1_baseStorage_example",
                  "file2_baseStorage_example",
                ],
              },
            },
          },
          description:
            "An array of object names for the files to be included in the zip.",
        }),
        ApiResponse({
          status: 200,
          description: "Successfully downloaded the files as a zip.",
        }),
        ApiResponse({
          status: 400,
          description: "Batch file download failed due to a bad request.",
        })
      );

    case "download/:objectName":
      return applyDecorators(
        ApiOperation({
          summary: "دانلود فایل",
          description: "دانلود فایل با استفاده از نام شیء",
        }),
        ApiParam({ name: "objectName", description: "نام شیء برای دانلود" }),
        ApiResponse({ status: 200, description: "فایل با موفقیت دانلود شد" }),
        ApiResponse({ status: 404, description: "فایل یافت نشد" })
      );
  }
}
