import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export type OrganizationDocument = HydratedDocument<Organization>;

export enum COMMISSION_TYPE {
  fixed = 'fixed',
  percentage = 'percentage',
}

@Schema({ timestamps: true })
export class Organization {
  @Prop({ required: true, unique: true, trim: true })
  title!: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  agentId!: Types.ObjectId;

  @Prop({ type: String, enum: COMMISSION_TYPE, required: true })
  commissionType!: COMMISSION_TYPE;

  @Prop({ type: Number, required: true })
  commissionAmount!: number;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
