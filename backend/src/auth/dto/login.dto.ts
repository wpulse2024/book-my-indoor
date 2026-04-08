import { IsBoolean, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class LoginDto {
  /**
   * Phone number OR email address
   */
  @IsString()
  @IsNotEmpty()
  identifier!: string;

  /** Required only when isOtpLogin is false */
  @ValidateIf((o) => !o.isOtpLogin)
  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsBoolean()
  @IsNotEmpty()
  isOtpLogin!: boolean;
}
