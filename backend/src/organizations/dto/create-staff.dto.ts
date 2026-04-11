import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phone!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  /** Optional role to assign. Falls back to the 'user' role if not provided. */
  @IsMongoId()
  @IsOptional()
  roleId?: string;
}
