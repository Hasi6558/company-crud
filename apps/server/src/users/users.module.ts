import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PasswordsService } from './passwords.service';
import { User } from './user.entity';
import { Password } from './password.entity';
import { Role } from '../roles/role.entity';
import { Permission } from 'src/auth/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Password, Role, Permission])],
  controllers: [UsersController],
  providers: [UsersService, PasswordsService],
  exports: [UsersService, PasswordsService],
})
export class UsersModule {}
