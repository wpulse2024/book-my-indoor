import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateUserDto {
  @IsString()
  @IsNotEmpty()
  identifier!: string;
}
