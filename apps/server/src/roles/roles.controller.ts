import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './create-role.dto';
import { UpdateRoleDto } from './update-role.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { Permissions } from '../auth/permissions.enum';
import { Permission } from '../auth/permission.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(AuthGuard, PermissionGuard)
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @UseGuards(AuthGuard, PermissionGuard)
  @Permission(Permissions.CREATE_ROLES)
  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @UseGuards(AuthGuard, PermissionGuard)
  @Permission(Permissions.UPDATE_ROLES)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @UseGuards(AuthGuard, PermissionGuard)
  @Permission(Permissions.DELETE_ROLES)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
