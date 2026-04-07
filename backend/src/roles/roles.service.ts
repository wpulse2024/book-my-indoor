import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleModel.findOne({ name: dto.name });
    if (existing) throw new ConflictException(`Role '${dto.name}' already exists`);
    return this.roleModel.create(dto);
  }

  findAll(): Promise<Role[]> {
    return this.roleModel.find().populate('permissions').lean().exec();
  }

  findAllExceptAdmin(): Promise<Role[]> {
    return this.roleModel
      .find({ name: { $ne: 'admin' } })
      .populate('permissions')
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleModel
      .findById(id)
      .populate('permissions')
      .lean()
      .exec();
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleModel.findOne({ name }).populate('permissions').lean().exec();
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('permissions')
      .lean()
      .exec();
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async remove(id: string): Promise<void> {
    const result = await this.roleModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Role not found');
  }
}
