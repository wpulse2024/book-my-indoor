import { IsEnum, IsOptional } from 'class-validator';
import { VenueStatus } from '../schemas/venue.schema';

export class FindVenuesQueryDto {
  @IsEnum(VenueStatus)
  @IsOptional()
  status?: VenueStatus;
}
