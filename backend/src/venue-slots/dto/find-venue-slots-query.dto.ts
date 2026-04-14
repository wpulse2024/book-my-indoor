import { IsDateString, IsEnum, IsInt, IsMongoId, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
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

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
