import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IUserEntity } from '../interfaces';

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: true,
  versionKey: false,
})
export class User implements IUserEntity {
  @Prop({ type: String, required: true })
  public _id: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  })
  phone: string;

  @Prop({
    type: String,
    required: true,
    select: false,
  })
  password: string;

  @Prop({ type: String, trim: true })
  userName?: string;

  @Prop({
    type: String,
    trim: true,
    sparse: true,
    index: true,
  })
  nationalId?: string;

  @Prop({ type: String, trim: true })
  imageId?: string;

  @Prop({
    type: String,
    enum: ['male', 'female', 'other'],
    required: false,
  })
  gender?: string;

  @Prop({ type: String, trim: true })
  lastName?: string;

  @Prop({ type: String, trim: true })
  firstName?: string;

  @Prop({ type: String, trim: true })
  address?: string;

  @Prop({ type: String, trim: true, index: true })
  city?: string;

  @Prop({ type: Number, min: 0, max: 150 })
  age?: number;

  @Prop({ type: Date })
  currentLoginTime?: Date;

  @Prop({ type: Date })
  previousLoginTime?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ phone: 1 }, { unique: true });
UserSchema.index({ nationalId: 1 }, { unique: true, sparse: true });
UserSchema.index({ lastName: 1, firstName: 1 });
UserSchema.index({ city: 1, age: 1 });
UserSchema.index({
  firstName: 'text',
  lastName: 'text',
  userName: 'text',
  phone: 'text',
});
