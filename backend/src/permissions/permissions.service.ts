import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<PermissionDocument>,
  ) {}

  async create(dto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionModel.findOne({ name: dto.name });
    if (existing) throw new ConflictException(`Permission '${dto.name}' already exists`);
    return this.permissionModel.create(dto);
  }

  findAll(): Promise<Permission[]> {
    return this.permissionModel.find().lean().exec();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionModel.findById(id).lean().exec();
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async remove(id: string): Promise<void> {
    const result = await this.permissionModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Permission not found');
  }
}
