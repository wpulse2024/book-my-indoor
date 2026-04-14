import { ArrayNotEmpty, IsArray, IsEnum, IsMongoId } from 'class-validator';
import { SlotStatus } from '../schemas/venue-slot.schema';

export class BulkUpdateSlotStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  ids!: string[];

  @IsEnum([SlotStatus.PUBLISH, SlotStatus.UNPUBLISH])
  status!: SlotStatus.PUBLISH | SlotStatus.UNPUBLISH;
}
