import { Transform } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
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

  // Multipart sends nested objects as JSON strings — parse and instantiate
  // the class explicitly so whitelist/validation decorators are recognised.
  @Transform(({ value }) =>
    plainToInstance(
      VenueLocationDto,
      typeof value === 'string' ? JSON.parse(value) : value,
    ),
  )
  @ValidateNested()
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
