import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { PasswordsService } from './passwords.service';
import { ChangePasswordDto, SetPasswordDto } from './password.dto';

@Controller('users/:userId/password')
export class passwordsController {
  constructor(private readonly passwords: PasswordsService) {}

  //set when after user creation
  @Post()
  async setInitial(@Param('userid') userid: string, @Body() dto: SetPasswordDto) {
    return this.passwords.setInitialPassword(userid, dto.password);
  }

  //change
  @Patch()
  async change(@Param('userId') userId: string, @Body() dto: ChangePasswordDto) {
    return this.passwords.changePassword(userId, dto.newPassword);
  }
}
