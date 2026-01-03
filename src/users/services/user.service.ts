import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  IUserEntity,
  IUserRepository,
  IUserService,
  USER_REPOSITORY,
} from '../interfaces';
import { CheckUserExistDto, CreateUserDto, GetUserDto } from '../dtos';
import { IMetaData } from '../../common';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    protected readonly repository: IUserRepository,
  ) {}

  private handleMetaData(meta: IMetaData) {
    console.log('Request Metadata:', meta);
  }

  async checkUserExist(
    data: CheckUserExistDto,
    meta: IMetaData,
  ): Promise<{ exists: boolean }> {
    this.handleMetaData(meta);

    const { phone, userName, nationalId } = data;
    if (!phone && !userName && !nationalId) {
      throw new ConflictException(
        'At least one parameter (phone, userName, nationalId) is required',
      );
    }

    const foundUser = await this.repository.findOne({
      $or: [{ phone }, { userName }, { nationalId }],
    });

    return { exists: !!foundUser };
  }

  async findUserByUserName(
    data: { userName: string },
    meta: IMetaData,
  ): Promise<any> {
    this.handleMetaData(meta);

    const user = await this.repository.findOne({ userName: data.userName });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findUserByPhone(
    data: { phone: string },
    meta: IMetaData,
  ): Promise<any> {
    this.handleMetaData(meta);

    const user = await this.repository.findOne({ phone: data.phone });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(data: CreateUserDto, meta: IMetaData): Promise<any> {
    this.handleMetaData(meta);

    if (!data.id) {
      throw new ConflictException('ID is required');
    }

    const existingPhone = await this.repository.findOne({
      phone: data.phone,
    });
    if (existingPhone) {
      throw new ConflictException('Phone number already exists');
    }

    if (data.userName) {
      const existingUserName = await this.repository.findOne({
        userName: data.userName,
      });
      if (existingUserName) {
        throw new ConflictException('Username already exists');
      }
    }

    const createdUser = await this.repository.create(data);

    return createdUser;
  }

  async getUserById(
    data: GetUserDto,
    meta: IMetaData,
  ): Promise<IUserEntity | null> {
    this.handleMetaData(meta);

    const user = await this.repository.findById(data.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
