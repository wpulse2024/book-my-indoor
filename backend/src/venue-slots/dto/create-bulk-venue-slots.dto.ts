import { IsDateString, IsMongoId } from 'class-validator';

export class CreateBulkVenueSlotsDto {
  @IsMongoId()
  venueId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
