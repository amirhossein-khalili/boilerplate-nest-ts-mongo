import { IUserMeta } from '../../common/interfaces/user-meta.interface';

export interface IUserService {
  lookUpUser(userMeta: IUserMeta);
}
