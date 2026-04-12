import { Transform } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { VenueLocationDto, VenueSlotDto } from './create-venue.dto';
import { VenueStatus } from '../schemas/venue.schema';

export class UpdateVenueDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Transform(({ value }) =>
    plainToInstance(
      VenueLocationDto,
      typeof value === 'string' ? JSON.parse(value) : value,
    ),
  )
  @ValidateNested()
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

  @IsEnum(VenueStatus)
  @IsOptional()
  status?: VenueStatus;

  @Transform(({ value }) => {
    const arr = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(arr)
      ? arr.map((item: unknown) => plainToInstance(VenueSlotDto, item))
      : [];
  })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  slots?: VenueSlotDto[];
}
