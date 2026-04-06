import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  /**
   * Phone number OR email address
   */
  @IsString()
  @IsNotEmpty()
  identifier!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
