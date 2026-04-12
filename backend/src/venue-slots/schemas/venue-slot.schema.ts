import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Venue } from '../../venues/schemas/venue.schema';
import { Organization } from '../../organizations/schemas/organization.schema';
import { User } from '../../users/schemas/user.schema';

export type VenueSlotDocument = HydratedDocument<VenueSlot>;

export enum SlotStatus {
  DRAFT = 'draft',
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
}

export enum BookingStatus {
  BOOKED = 'booked',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export enum PaymentStatus {
  PENDING_FOR_PAYMENT = 'pending_for_payment',
  PAYMENT_DONE = 'payment_done',
  PAYMENT_VERIFIED = 'payment_verified',
  PAYMENT_REJECTED = 'payment_rejected',
}

export enum PaymentMethod {
  BKASH = 'Bkash',
  NAGAD = 'Nagad',
  ROCKET = 'Rocket',
  CASH = 'Cash',
}

@Schema({ _id: false })
export class BookingInfo {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING_FOR_PAYMENT })
  paymentStatus!: PaymentStatus;

  @Prop({ type: Date, required: true })
  bookingTime!: Date;

  @Prop({ type: String, enum: PaymentMethod })
  paymentMethod?: PaymentMethod;

  @Prop({ type: String })
  transactionId?: string;

  @Prop({ type: String })
  paymentNumber?: string;
}

@Schema({ _id: false })
export class BookingHistoryEntry {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: PaymentStatus, required: true })
  paymentStatus!: PaymentStatus;

  @Prop({ type: Date, required: true })
  bookingTime!: Date;

  @Prop({ type: String, enum: PaymentMethod })
  paymentMethod?: PaymentMethod;

  @Prop({ type: String })
  transactionId?: string;

  @Prop({ type: String })
  paymentNumber?: string;

  @Prop({ type: String, enum: BookingStatus, required: true })
  bookingStatus!: BookingStatus;
}

@Schema({ timestamps: true })
export class VenueSlot {
  @Prop({ type: Types.ObjectId, ref: Organization.name, required: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Venue.name, required: true })
  venueId!: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date!: Date;

  @Prop({ type: String, required: true })
  startTime!: string;

  @Prop({ type: String, required: true })
  endTime!: string;

  @Prop({ type: Number, required: true, min: 0 })
  slotPrice!: number;

  @Prop({ type: Number, min: 0 })
  commissionAmount?: number;

  @Prop({ type: Number, min: 0 })
  totalAmount?: number;

  @Prop({ type: String, enum: SlotStatus, default: SlotStatus.DRAFT })
  status!: SlotStatus;

  @Prop({ type: String, enum: BookingStatus })
  bookingStatus?: BookingStatus;

  @Prop({ type: BookingInfo })
  bookingInfo?: BookingInfo;

  @Prop({ type: [BookingHistoryEntry], default: [] })
  bookingHistory!: BookingHistoryEntry[];
}

export const VenueSlotSchema = SchemaFactory.createForClass(VenueSlot);
