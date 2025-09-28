import { IsArray, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsOptional()
  @MinLength(6, { message: 'Role name must be at least 6 characters long' })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
