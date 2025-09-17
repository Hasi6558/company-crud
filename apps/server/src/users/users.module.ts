import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Password } from './password.entity';
import { Role } from './role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Password, Role])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
