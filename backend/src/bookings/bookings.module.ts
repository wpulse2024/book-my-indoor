import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { Venue, VenueSchema } from '../venues/schemas/venue.schema';
import { VenueSlot, VenueSlotSchema } from '../venue-slots/schemas/venue-slot.schema';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Venue.name, schema: VenueSchema },
      { name: VenueSlot.name, schema: VenueSlotSchema },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
