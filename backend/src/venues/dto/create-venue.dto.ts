import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class VenueLocationDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  long!: number;
}

export class VenueSlotDto {
  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @IsNumber()
  @Min(0)
  price!: number;
}

export class CreateVenueDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  @ValidateNested()
  @Type(() => VenueLocationDto)
  location!: VenueLocationDto;

  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  features?: string[];

  @IsMongoId()
  categoryId!: string;

  @IsMongoId()
  @IsOptional()
  organizationId?: string;

  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VenueSlotDto)
  @IsOptional()
  slots?: VenueSlotDto[];
}
