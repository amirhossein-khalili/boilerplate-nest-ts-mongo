export * from './api-document-builder';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { paramTypeEnhancer } from './api-document-builder';

export const ParamEx = createParamDecorator(
  async (data: any, ctx: ExecutionContext): Promise<any> => {
    const body =
      ctx.getType<'http' | 'rmq'>() === 'rmq'
        ? ctx.switchToRpc().getData()
        : ctx.switchToHttp().getRequest().params;
    if (typeof body === 'string') {
      return body;
    }
    return data ? body[data] : body;
  },
  [paramTypeEnhancer('path')],
);
