import { CreateUserDto } from '../dtos';
import { UserEntity } from '../models/user.entity';

export interface IUserRepository {
  create(data: CreateUserDto): Promise<any>;
  findByEmail(data: { email: string }): Promise<any>;
  findByPhoneNumber(phoneNumber: string): Promise<UserEntity>;
  getUserById(id: string): Promise<any>;
}
