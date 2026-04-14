import { ArrayNotEmpty, IsArray, IsMongoId } from 'class-validator';

export class BulkDeleteVenueSlotsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  ids!: string[];
}
