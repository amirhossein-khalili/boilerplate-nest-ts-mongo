import { IUserMeta } from '.';

export interface IUserService {
  lookUpUser(userMeta: IUserMeta);
}
