import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, IUserService } from '../interfaces';
import { USER_REPOSITORY } from '../../common';
import { UserNotFoundException } from '../exceptions';
import { IUserMeta } from '../../common/interfaces';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    protected readonly repository: IUserRepository,
  ) {}

  async lookUpUser(userMeta: IUserMeta) {
    const user = await this.repository.getUserById(userMeta.id);
    if (!user) throw new UserNotFoundException(userMeta.id);
    return user;
  }
}
