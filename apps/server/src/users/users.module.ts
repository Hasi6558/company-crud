import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PasswordsService } from './passwords.service';
import { User } from './user.entity';
import { Password } from './password.entity';
import { Role } from '../roles/role.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Password, Role]), forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService, PasswordsService],
  exports: [UsersService, PasswordsService],
})
export class UsersModule {}
