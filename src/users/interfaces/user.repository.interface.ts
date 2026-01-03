import { IBaseRepository } from '../../common';
import { CreateUserDto } from '../dtos';
import { User, UserDocument } from '../models/user.entity';

export interface IUserRepository extends IBaseRepository<UserDocument> {
  create(data: CreateUserDto): Promise<UserDocument>;
  findByPhoneNumber(phoneNumber: string): Promise<UserDocument | null>;
  getUserById(id: string): Promise<User | null>;
}
