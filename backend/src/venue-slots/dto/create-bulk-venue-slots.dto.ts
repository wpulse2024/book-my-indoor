import { IsDateString, IsEnum, IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';
import { SlotStatus } from '../schemas/venue-slot.schema';

export class CreateBulkVenueSlotsDto {
  @IsMongoId()
  venueId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  /** Override the venue template price for all generated slots */
  @IsNumber()
  @Min(0)
  @IsOptional()
  slotPrice?: number;

  /** Status for generated slots — defaults to publish */
  @IsEnum(SlotStatus)
  @IsOptional()
  status?: SlotStatus;
}
