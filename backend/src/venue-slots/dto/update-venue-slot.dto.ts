import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SlotStatus } from '../schemas/venue-slot.schema';

export class UpdateVenueSlotDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  slotPrice?: number;

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
