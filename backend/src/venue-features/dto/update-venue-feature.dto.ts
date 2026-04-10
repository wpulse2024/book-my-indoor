import { IsOptional, IsString } from 'class-validator';

export class UpdateVenueFeatureDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
