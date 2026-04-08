import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp!: string;
}
