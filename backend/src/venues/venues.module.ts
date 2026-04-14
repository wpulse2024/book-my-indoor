import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Venue, VenueSchema } from './schemas/venue.schema';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Venue.name, schema: VenueSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [MongooseModule],
})
export class VenuesModule {}
