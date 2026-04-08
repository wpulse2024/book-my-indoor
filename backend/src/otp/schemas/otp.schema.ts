import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

export enum OtpType {
  REGISTER = 'register',
  LOGIN = 'login',
  RESET_PASSWORD = 'reset_password',
}

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop({ required: true })
  otp!: string; // hashed

  @Prop({ required: true, enum: OtpType })
  type!: OtpType;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ default: false })
  isUsed!: boolean;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// TTL index: MongoDB auto-removes documents 0 seconds after expiresAt
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
