import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String})
  name!: string;

  @Prop({ required: true, unique: true, trim: true })
  phone!: string;

  @Prop({
    unique: true,
    sparse: true, // allows multiple null values (optional field)
    lowercase: true,
    trim: true,
  })
  email?: string;

  @Prop({ type: String, select: false })
  password?: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: Role.name }],
    default: [],
  })
  roles!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Organization', default: null })
  organization?: Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
