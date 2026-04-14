import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrganizationDocument = HydratedDocument<Organization>;

export enum COMMISSION_TYPE {
  fixed = 'fixed',
  percentage = 'percentage',
}

export enum ORGANIZATION_STATUS {
  pending = 'pending',
  active = 'active',
  suspended = 'suspended',
}

@Schema({ timestamps: true })
export class Organization {
  @Prop({ required: true, unique: true, trim: true })
  title!: string;

  @Prop({ type: String, trim: true })
  ownerName?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  agentId!: Types.ObjectId;

  @Prop({ type: String, enum: COMMISSION_TYPE, required: true })
  commissionType!: COMMISSION_TYPE;

  @Prop({ type: Number, required: true })
  commissionAmount!: number;

  @Prop({ type: String, enum: ORGANIZATION_STATUS, default: ORGANIZATION_STATUS.active })
  status!: ORGANIZATION_STATUS;

  @Prop({ type: String, trim: true })
  logo?: string;

  @Prop({ type: String, trim: true })
  place?: string;

  @Prop({ type: String, trim: true })
  description?: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
