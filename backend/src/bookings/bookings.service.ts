import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Booking,
  BookingDocument,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from './schemas/booking.schema';
import { Venue, VenueDocument } from '../venues/schemas/venue.schema';
import { CreateBookingDto } from './dto/create-booking.dto';

const PER_PAGE = 20;

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Venue.name) private readonly venueModel: Model<VenueDocument>,
  ) {}

  async createBooking(dto: CreateBookingDto, userId: string): Promise<BookingDocument> {
    // 1. Validate transaction ID for digital payment methods
    if (
      (dto.paymentMethod === PaymentMethod.BKASH ||
        dto.paymentMethod === PaymentMethod.NAGAD) &&
      !dto.transactionId
    ) {
      throw new BadRequestException(
        'Transaction ID is required for bKash and Nagad payments',
      );
    }

    // 2. Fetch venue and locate the slot (slots are embedded, not a separate collection)
    const venue = await this.venueModel.findById(dto.venueId).lean().exec();
    if (!venue) throw new NotFoundException('Venue not found');

    const slot = (venue.slots as any[]).find(
      (s: any) => s._id.toString() === dto.slotId,
    );
    if (!slot) throw new NotFoundException('Slot not found in this venue');

    // 3. Reject past dates
    const today = new Date().toISOString().split('T')[0];
    if (dto.bookingDate < today) {
      throw new BadRequestException('Booking date cannot be in the past');
    }

    // 4. Build payload (denormalize slot fields so the booking is self-contained)
    const bookingRef = this.generateBookingRef();
    const payload = {
      venueId: new Types.ObjectId(dto.venueId),
      slotId: new Types.ObjectId(dto.slotId),
      userId: new Types.ObjectId(userId),
      guestName: dto.guestName,
      bookingDate: dto.bookingDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price,
      status: BookingStatus.CONFIRMED,
      paymentMethod: dto.paymentMethod,
      paymentStatus: PaymentStatus.UNPAID,
      transactionId: dto.transactionId,
      bookingRef,
      notes: dto.notes,
    };

    // 5. Insert — compound unique index handles double-booking atomically
    try {
      return await this.bookingModel.create(payload);
    } catch (err: any) {
      if (err.code === 11000) {
        if (err.keyPattern?.bookingRef) {
          // Extremely rare ref collision — retry once with a new ref
          return this.bookingModel.create({ ...payload, bookingRef: this.generateBookingRef() });
        }
        throw new ConflictException('This slot is already booked for the selected date');
      }
      throw err;
    }
  }

  async getUserBookings(userId: string, page = 1) {
    const skip = (page - 1) * PER_PAGE;
    const [items, total] = await Promise.all([
      this.bookingModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate('venueId', 'title images location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PER_PAGE)
        .lean()
        .exec(),
      this.bookingModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return {
      items,
      total,
      page,
      perPage: PER_PAGE,
      totalPages: Math.ceil(total / PER_PAGE),
    };
  }

  async getBookingByRef(bookingRef: string) {
    const booking = await this.bookingModel
      .findOne({ bookingRef })
      .populate('venueId', 'title images location')
      .lean()
      .exec();
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  private generateBookingRef(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `BMI-${year}-${random}`;
  }
}
