import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { VenueLocationDto, VenueSlotDto } from './create-venue.dto';

export class UpdateVenueDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  @ValidateNested()
  @Type(() => VenueLocationDto)
  @IsOptional()
  location?: VenueLocationDto;

  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  features?: string[];

  @IsMongoId()
  @IsOptional()
  categoryId?: string;

  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VenueSlotDto)
  @IsOptional()
  slots?: VenueSlotDto[];
}
