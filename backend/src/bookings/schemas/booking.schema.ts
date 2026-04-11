import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentMethod {
  CASH = 'cash',
  BKASH = 'bkash',
  NAGAD = 'nagad',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true })
  venueId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  slotId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: String })
  guestName?: string;

  /** "YYYY-MM-DD" — stored as string to avoid timezone shifting */
  @Prop({ type: String, required: true })
  bookingDate!: string;

  /** Denormalized from slot at booking time */
  @Prop({ type: String, required: true })
  startTime!: string;

  @Prop({ type: String, required: true })
  endTime!: string;

  @Prop({ type: Number, required: true })
  price!: number;

  @Prop({ type: String, enum: BookingStatus, default: BookingStatus.CONFIRMED })
  status!: BookingStatus;

  @Prop({ type: String, enum: PaymentMethod, required: true })
  paymentMethod!: PaymentMethod;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus!: PaymentStatus;

  @Prop({ type: String })
  transactionId?: string;

  /** Human-readable ref e.g. "BMI-2026-4821" */
  @Prop({ type: String, required: true, unique: true })
  bookingRef!: string;

  @Prop({ type: String })
  notes?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

/**
 * Compound unique index prevents double-booking the same slot on the same date.
 * The partial filter only applies to active bookings — cancelled slots can be rebooked.
 */
BookingSchema.index(
  { venueId: 1, slotId: 1, bookingDate: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } },
  },
);
