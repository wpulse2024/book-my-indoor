import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: String, required: true, unique: true, trim: true })
  title!: string;

  @Prop({ type: String, required: true, trim: true })
  image!: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
