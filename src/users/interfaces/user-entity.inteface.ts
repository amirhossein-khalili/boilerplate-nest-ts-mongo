export interface IUserEntity {
  _id: string;

  phone: string;

  password: string;

  userName?: string;

  nationalId?: string;

  imageId?: string;

  gender?: string;

  lastName?: string;

  firstName?: string;

  address?: string;

  city?: string;

  age?: number;

  currentLoginTime?: Date;

  previousLoginTime?: Date;
}
