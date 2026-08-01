import { Role } from '../enums/role.enum';

import {
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
