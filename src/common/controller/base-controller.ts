import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { IMetaData, IMessage, MessageType, IUserMeta } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export abstract class BaseController {
  protected readonly apiVersion: number = 1;

  /**
   * Generate metadata for API responses
   */
  protected generateMetaData(
    request?: Request,
    user?: IUserMeta,
    pagination?: {
      limit?: number;
      offset?: number;
      total?: number;
    },
  ): IMetaData {
    const headers = request?.headers || {};

    return {
      version: this.apiVersion,
      timestamp: Date.now(),
      requestId: this.extractHeader(headers, 'x-request-id') || uuidv4(),
      correlationId: this.extractHeader(headers, 'x-correlation-id'),
      causationId:
        this.extractHeader(headers, 'x-causation-id') ||
        this.extractHeader(headers, 'x-correlation-id'),
      pagination,
      user,
    };
  }

  /**
   * Create success response with metadata
   */
  protected createSuccessResponse<T>(
    data: T,
    metadata: IMetaData,
  ): { data: T; meta: IMetaData } {
    return { data, meta: metadata };
  }

  /**
   * Create error response with metadata
   */
  protected createErrorResponse(
    error: string | Error,
    metadata: Omit<IMetaData, 'messages'>,
    errorCode?: string,
  ): { error: string; meta: IMetaData } {
    const errorMessage = typeof error === 'string' ? error : error.message;

    const errorMessageObj: IMessage = {
      type: MessageType.ERROR,
      message: errorMessage,
      code: errorCode,
      timestamp: Date.now(),
      correlationId: metadata.correlationId,
    };

    return {
      error: errorMessage,
      meta: {
        ...metadata,
        messages: [errorMessageObj],
      },
    };
  }

  /**
   * Parse pagination from query parameters
   */
  protected parsePagination(
    query: any,
    defaultLimit: number = 20,
    maxLimit: number = 100,
  ): { limit: number; offset: number } {
    const limit = Math.min(parseInt(query.limit, 10) || defaultLimit, maxLimit);
    const offset = parseInt(query.offset, 10) || 0;

    return { limit, offset };
  }

  /**
   * Extract user from request (to be implemented by child controllers)
   */
  //   protected abstract extractUser(
  //     request: Request,
  //   ): Promise<IUserMeta | undefined>;

  /**
   * Extract header value from headers object
   */
  private extractHeader(
    headers: Record<string, any>,
    headerName: string,
  ): string | undefined {
    const value = headers[headerName] || headers[headerName.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  }
}
