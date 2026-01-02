import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RolesEnum, UserStatusEnum } from '../enums';

export type UserDocument = UserEntity & Document;

@Schema({ collection: 'user', timestamps: true })
export class UserEntity {
  @Prop({ type: String, required: true })
  public _id: string;

  @Prop({ type: String, required: true, unique: true })
  public phoneNumber: string;

  @Prop({ type: String, enum: RolesEnum, required: true, default: 'user' })
  public role: (typeof RolesEnum)[number];

  @Prop({
    type: String,
    enum: UserStatusEnum,
    required: true,
    default: 'created',
  })
  public status: (typeof UserStatusEnum)[number];

  @Prop({ type: Boolean, default: true })
  public isActive: boolean;
}

const UserSchema = SchemaFactory.createForClass(UserEntity);

UserSchema.index({ phoneNumber: 1 }, { unique: true });

export { UserSchema };
