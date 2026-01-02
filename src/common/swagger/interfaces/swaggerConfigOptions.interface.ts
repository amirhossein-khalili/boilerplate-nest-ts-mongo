import { INestApplication } from '@nestjs/common';
import { ISwaggerCustomOptions } from '.';

export interface SwaggerConfigOptions {
  app: INestApplication;
  name: string;
  module: any;
  server?: string | { gateway?: string; service?: string };
  opts?: ISwaggerCustomOptions;
}
