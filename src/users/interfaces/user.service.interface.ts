import { IUserMeta } from '../../common/interfaces';

export interface IUserService {
  lookUpUser(userMeta: IUserMeta);
}
