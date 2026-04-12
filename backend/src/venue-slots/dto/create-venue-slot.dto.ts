import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SlotStatus } from '../schemas/venue-slot.schema';

export class CreateVenueSlotDto {
  @IsMongoId()
  venueId!: string;

  @IsDateString()
  date!: string;

  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @IsNumber()
  @Min(0)
  slotPrice!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  commissionAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @IsEnum(SlotStatus)
  @IsOptional()
  status?: SlotStatus;
}
