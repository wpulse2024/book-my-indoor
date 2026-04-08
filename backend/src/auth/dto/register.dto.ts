import {
  IsNotEmpty,
  IsPhoneNumber,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phone!: string;
}
