import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from '../dtos';
import { UserDocument, UserEntity } from '../models/user.entity';
import { IUserRepository } from '../interfaces';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserEntity.name)
    private UserModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  findByEmail(data: { email: string }): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async create(data: CreateUserDto): Promise<any> {
    return this.UserModel.create({
      _id: data.id,
      phoneNumber: data.phoneNumber,
    });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<UserEntity> {
    return this.UserModel.findOne({ phoneNumber });
  }

  async getUserById(id: string): Promise<any> {
    return this.UserModel.findById(id).lean();
  }
}
