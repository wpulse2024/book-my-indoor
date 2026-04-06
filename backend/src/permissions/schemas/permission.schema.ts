import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ timestamps: true })
export class Permission {
  @Prop({ required: true, unique: true, trim: true })
  name!: string; // e.g. "users:read", "users:write", "roles:manage"

  @Prop({ trim: true })
  description?: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
