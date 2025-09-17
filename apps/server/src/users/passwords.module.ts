import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Module } from '@nestjs/common';
import { PasswordsService } from './passwords.service';
import { passwordsController } from './passwords.controller';
import { Password } from './password.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Password])],
  providers: [PasswordsService],
  controllers: [passwordsController],
  exports: [PasswordsService],
})
export class PasswordsModule {}
