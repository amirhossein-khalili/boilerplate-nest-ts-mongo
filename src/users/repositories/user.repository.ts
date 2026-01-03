import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.entity';
import { IUserRepository } from '../interfaces';
import { BaseRepository } from '../../common';

@Injectable()
export class UserRepository
  extends BaseRepository<UserDocument>
  implements IUserRepository
{
  constructor(@InjectModel(User.name) model: Model<UserDocument>) {
    super(model);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<UserDocument | null> {
    return this.model.findOne({ phone: phoneNumber }).exec();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.model.findById(id).lean<User>().exec();
  }
}
