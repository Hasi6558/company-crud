import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './create-user.dto';
import { UseGuards } from '@nestjs/common';
import { Permission } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/permission.guard';
import { AuthGuard } from '../auth/auth.guard';
import { Permissions } from '../auth/permissions.enum';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Permission(Permissions.READ_USERS)
  @Get('search')
  searchUsers(@Query('name') name?: string) {
    return this.usersService.searchUsers(name);
  }

  @Permission(Permissions.READ_USERS)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Permission(Permissions.READ_PROFILE)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Permission(Permissions.READ_PROFILE)
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findOne(email);
  }

  @Permission(Permissions.CREATE_USERS)
  @Post('')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Permission(Permissions.DELETE_USERS)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
  @Permission(Permissions.UPDATE_USERS)
  @Patch('update/:id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateUserDto>) {
    return this.usersService.update(id, dto);
  }
}
