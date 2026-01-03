import { PaginatedResponse } from './paginate.interface';

export interface IBaseRepository<T> {
  create(createDto: any): Promise<T>;

  findById(id: string): Promise<T>;

  find(filter: any): Promise<T[]>;

  findOne(filter: any): Promise<T | null>;

  update(id: string, updateDto: any): Promise<T>;

  delete(id: string): Promise<T>;

  paginate(page: number, pageSize: number): Promise<PaginatedResponse<T>>;
}
