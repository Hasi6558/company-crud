import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
