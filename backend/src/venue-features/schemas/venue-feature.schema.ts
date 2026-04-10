import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VenueFeatureDocument = HydratedDocument<VenueFeature>;

@Schema({ timestamps: true })
export class VenueFeature {
  @Prop({ type: String, required: true, unique: true, trim: true })
  name!: string;

  @Prop({ type: String, required: true, trim: true })
  icon!: string;
}

export const VenueFeatureSchema = SchemaFactory.createForClass(VenueFeature);
