import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateuserDto } from 'src/dto/create-user.dto';
import { UserService } from 'src/services/users.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post('')
  create(@Body() dto: CreateuserDto) {
    return this.userService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
