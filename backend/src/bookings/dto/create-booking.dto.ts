import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PaymentMethod } from '../schemas/booking.schema';

export class CreateBookingDto {
  @IsMongoId()
  venueId!: string;

  @IsMongoId()
  slotId!: string;

  /** "YYYY-MM-DD" */
  @IsDateString()
  bookingDate!: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  guestName?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(30)
  transactionId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
