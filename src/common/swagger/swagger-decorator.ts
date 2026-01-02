import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SwaggerExample, SwaggerName, SwaggerType } from './enum';
import { IResponseSchema } from './interfaces/responseSchema.interface';
import { IParamSchema } from './interfaces/paramSchema.interface';
import { IQueryPaginationSchema } from './interfaces/queryPaginationSchema.interface';

const defaultResponseSchema: IResponseSchema = {
  createdResponse: {
    schema: {
      properties: {
        success: { type: SwaggerType.BOOLEAN },
        data: { type: SwaggerType.OBJECT },
        meta: { type: SwaggerType.OBJECT },
      },
    },
  },
  updatedResponse: {
    schema: {
      properties: {
        success: { type: SwaggerType.BOOLEAN },
        data: { type: SwaggerType.OBJECT },
        meta: { type: SwaggerType.OBJECT },
      },
    },
  },
  badRequestResponse: {
    schema: {
      properties: {
        statusCode: {
          type: SwaggerType.NUMBER,
          example: SwaggerExample.BAD_REQUEST_CODE,
        },
        message: {
          type: SwaggerType.ARRAY,
          items: { type: SwaggerType.STRING },
        },
        error: {
          type: SwaggerType.STRING,
          example: SwaggerExample.BAD_REQUEST_MSG,
        },
      },
    },
  },
  okResponse: {
    schema: {
      items: {
        type: SwaggerType.OBJECT,
        example: SwaggerExample.EMPTY_OBJECT,
      },
    },
  },
};

const defaultParamSchema: IParamSchema = {
  ApiParamSchema: {
    name: `${SwaggerName.ID}`,
    example: SwaggerExample.GUID,
  },
};

const defaultQuerySchema: IQueryPaginationSchema = {
  QueryLimitSchema: {
    name: `${SwaggerName.LIMIT}`,
    type: Number,
  },
  QueryOffsetSchema: {
    name: `${SwaggerName.OFFSET}`,
    type: Number,
  },
};

export const SwaggerPost = (summary: string, param = false) => {
  const decorators = [
    ApiOperation({ summary }),
    ApiCreatedResponse(defaultResponseSchema.createdResponse),
    ApiBadRequestResponse(defaultResponseSchema.badRequestResponse),
  ];
  if (param) {
    decorators.push(ApiParam(defaultParamSchema.ApiParamSchema));
  }
  return applyDecorators(...decorators);
};

export const SwaggerPatch = (summary: string, param = false) => {
  const decorators = [
    ApiOperation({ summary }),
    ApiOkResponse(defaultResponseSchema.updatedResponse),
    ApiBadRequestResponse(defaultResponseSchema.badRequestResponse),
  ];
  if (param) {
    decorators.push(ApiParam(defaultParamSchema.ApiParamSchema));
  }
  return applyDecorators(...decorators);
};

export const SwaggerPut = (summary: string, param = false) => {
  const decorators = [
    ApiOperation({ summary }),
    ApiCreatedResponse(defaultResponseSchema.createdResponse),
    ApiBadRequestResponse(defaultResponseSchema.badRequestResponse),
  ];
  if (param) {
    decorators.push(ApiParam(defaultParamSchema.ApiParamSchema));
  }
  return applyDecorators(...decorators);
};

export const SwaggerGet = (
  summary: string,
  param = true,
  pagination = false,
) => {
  const defaultDecorator = [
    ApiOperation({ summary }),
    ApiOkResponse(defaultResponseSchema.okResponse),
    ApiParam(defaultParamSchema.ApiParamSchema),
  ];
  if (pagination) {
    return applyDecorators(
      ...defaultDecorator,
      ApiQuery(defaultQuerySchema.QueryLimitSchema),
      ApiQuery(defaultQuerySchema.QueryOffsetSchema),
    );
  }
  if (!param) {
    return applyDecorators(
      ApiOperation({ summary }),
      ApiOkResponse(defaultResponseSchema.okResponse),
    );
  }
  return applyDecorators(...defaultDecorator);
};

export const SwaggerDelete = (summary: string, param = true) => {
  const decorators = [
    ApiOperation({ summary }),
    ApiOkResponse(defaultResponseSchema.okResponse),
  ];
  if (param) {
    decorators.push(ApiParam(defaultParamSchema.ApiParamSchema));
  }
  return applyDecorators(...decorators);
};
