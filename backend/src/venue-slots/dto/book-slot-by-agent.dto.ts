import { IsString, Matches } from 'class-validator';

export class BookSlotByAgentDto {
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'Invalid phone number' })
  userPhone!: string;
}
