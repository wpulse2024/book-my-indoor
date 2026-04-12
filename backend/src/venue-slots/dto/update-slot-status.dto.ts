import { IsEnum } from 'class-validator';
import { SlotStatus } from '../schemas/venue-slot.schema';

const PublishableStatus = {
  PUBLISH: SlotStatus.PUBLISH,
  UNPUBLISH: SlotStatus.UNPUBLISH,
} as const;

export class UpdateSlotStatusDto {
  @IsEnum(PublishableStatus, { message: 'status must be publish or unpublish' })
  status!: SlotStatus.PUBLISH | SlotStatus.UNPUBLISH;
}
