import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';
import { VenueFeature } from '../../venue-features/schemas/venue-feature.schema';
import { Organization } from '../../organizations/schemas/organization.schema';

export enum VenueStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
}

export type VenueDocument = HydratedDocument<Venue>;

@Schema({ _id: false })
export class VenueLocation {
  @Prop({ type: String, required: true, trim: true })
  title!: string;

  @Prop({ type: Number, required: true })
  lat!: number;

  @Prop({ type: Number, required: true })
  long!: number;
}

@Schema({ _id: true })
export class VenueSlot {
  @Prop({ type: String, required: true })
  startTime!: string;

  @Prop({ type: String, required: true })
  endTime!: string;

  @Prop({ type: Number, required: true })
  price!: number;
}

@Schema({ timestamps: true })
export class Venue {
  @Prop({ type: String, required: true, trim: true })
  title!: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: VenueLocation, required: true })
  location!: VenueLocation;

  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  rating!: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: VenueFeature.name }], default: [] })
  features!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
  categoryId!: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: [VenueSlot], default: [] })
  slots!: VenueSlot[];

  @Prop({ type: Types.ObjectId, ref: Organization.name, required: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: String, enum: VenueStatus, default: VenueStatus.ACTIVE })
  status!: VenueStatus;
}

export const VenueSchema = SchemaFactory.createForClass(Venue);
