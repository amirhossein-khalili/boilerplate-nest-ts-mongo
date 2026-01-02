import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from './models/user.entity';
import { UserRepository } from './repositories/user.repository';
import { USER_CONFIG, USER_SERVICE, USER_REPOSITORY } from '../common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [
    { provide: USER_SERVICE, useClass: UserService },
    { provide: USER_REPOSITORY, useClass: UserRepository },
  ],
  exports: [USER_REPOSITORY, USER_SERVICE, MongooseModule],
})
export class UserModule {
  static registerAsync(options: any): DynamicModule {
    return {
      module: UserModule,
      imports: options.imports,
      providers: [
        {
          provide: USER_CONFIG,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
    };
  }
}
