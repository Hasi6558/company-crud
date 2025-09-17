import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateuserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;
}
