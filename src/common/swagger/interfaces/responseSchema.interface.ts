import { ApiResponseOptions } from '@nestjs/swagger';

export interface IResponseSchema {
  createdResponse: ApiResponseOptions;
  updatedResponse: ApiResponseOptions;
  badRequestResponse: ApiResponseOptions;
  okResponse: ApiResponseOptions;
}
