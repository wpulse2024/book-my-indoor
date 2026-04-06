import {
  IsArray,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phone!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  roles?: string[];
}
