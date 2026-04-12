import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VenueSlot, VenueSlotSchema } from './schemas/venue-slot.schema';
import { Organization, OrganizationSchema } from '../organizations/schemas/organization.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { VenueSlotsService } from './venue-slots.service';
import { VenueSlotsController } from './venue-slots.controller';
import { VenuesModule } from '../venues/venues.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VenueSlot.name, schema: VenueSlotSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    VenuesModule,
  ],
  controllers: [VenueSlotsController],
  providers: [VenueSlotsService],
})
export class VenueSlotsModule {}
