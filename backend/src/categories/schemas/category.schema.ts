import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  image!: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
