import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Permission } from '../../permissions/schemas/permission.schema';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true, trim: true })
  name!: string; // e.g. "admin", "manager", "viewer"

  @Prop({ trim: true })
  description?: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: Permission.name }],
    default: [],
  })
  permissions!: Types.ObjectId[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
