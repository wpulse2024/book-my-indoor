import { ArrayNotEmpty, IsArray, IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';

export class BulkUpdateVenueSlotsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  ids!: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  slotPrice?: number;
}
