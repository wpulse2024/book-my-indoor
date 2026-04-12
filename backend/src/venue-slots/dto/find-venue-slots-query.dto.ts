import { IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { BookingStatus, SlotStatus } from '../schemas/venue-slot.schema';

export class FindVenueSlotsQueryDto {
  @IsMongoId()
  @IsOptional()
  venueId?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsEnum(SlotStatus)
  @IsOptional()
  status?: SlotStatus;

  @IsEnum(BookingStatus)
  @IsOptional()
  bookingStatus?: BookingStatus;
}
