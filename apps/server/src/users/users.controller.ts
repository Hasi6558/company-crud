import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateuserDto } from './create-user.dto';
import { UseGuards } from '@nestjs/common';
import { Permission } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/permission.guard';
import { AuthGuard } from '../auth/auth.guard';
import { Permissions } from '../auth/permissions.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, PermissionGuard)
  @Permission(Permissions.READ_USERS)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findOne(email);
  }

  @Post('')
  create(@Body() dto: CreateuserDto) {
    return this.usersService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
