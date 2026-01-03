import { IUserMeta } from '../../common';

export interface IUserService {
  lookUpUser(userMeta: IUserMeta);
  checkUserExist();
  findUserByUserName();
  findUserByPhone();
  createUser();
  
}
