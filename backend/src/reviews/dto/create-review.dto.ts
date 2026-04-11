import { IsBoolean, IsInt, IsMongoId, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  venueId!: string;

  @IsMongoId()
  bookingId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}
