import { ApiQueryOptions } from '@nestjs/swagger';

export interface IQueryPaginationSchema {
  QueryLimitSchema: ApiQueryOptions;
  QueryOffsetSchema: ApiQueryOptions;
}
