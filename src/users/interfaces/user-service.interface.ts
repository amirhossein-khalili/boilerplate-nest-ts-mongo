import { IMetaData } from '../../common';
import {
  CreateUserDto,
  CheckUserExistDto,
  FindUserByUserNameDto,
  FindUserByPhoneDto,
  GetUserDto,
} from '../dtos';
import { IUserEntity } from './user-entity.inteface';

export const USER_SERVICE = Symbol('IUserService');

export interface IUserService {
  checkUserExist(
    data: CheckUserExistDto,
    meta: IMetaData,
  ): Promise<{ exists: boolean }>;
  findUserByUserName(
    data: FindUserByUserNameDto,
    meta: IMetaData,
  ): Promise<IUserEntity | null>;
  findUserByPhone(
    data: FindUserByPhoneDto,
    meta: IMetaData,
  ): Promise<IUserEntity | null>;
  createUser(data: CreateUserDto, meta: IMetaData): Promise<IUserEntity>;
  getUserById(data: GetUserDto, meta: IMetaData): Promise<IUserEntity | null>;
}
