import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  Organization,
  OrganizationDocument,
} from './schemas/organization.schema';
import { Role, RoleDocument } from '../roles/schemas/role.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name)
    private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<OrganizationDocument> {
    const existing = await this.orgModel.findOne({ title: dto.title });
    if (existing) {
      throw new ConflictException(`Organization '${dto.title}' already exists`);
    }

    const agentRole = await this.roleModel.findOne({ name: 'agent' });
    if (!agentRole) {
      throw new NotFoundException("Role 'agent' not found. Run the seeder first.");
    }

    const existingUser = await this.userModel.findOne({
      $or: [
        { phone: dto.agent.phone },
        ...(dto.agent.email ? [{ email: dto.agent.email }] : []),
      ],
    });
    if (existingUser) {
      throw new ConflictException('Agent phone or email is already registered');
    }

    const hashed = await bcrypt.hash(dto.agent.password, 10);
    const agentUser = await this.userModel.create({
      phone: dto.agent.phone,
      email: dto.agent.email,
      password: hashed,
      roles: [agentRole._id],
      isActive: true,
    });

    const org = await this.orgModel.create({
      title: dto.title,
      commissionType: dto.commissionType,
      commissionAmount: dto.commissionAmount,
      agentId: agentUser._id,
    });

    return org.populate({ path: 'agentId', select: '-password' });
  }

  findAll(): Promise<OrganizationDocument[]> {
    return this.orgModel
      .find()
      .populate({ path: 'agentId', select: '-password' })
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<OrganizationDocument> {
    const org = await this.orgModel
      .findById(id)
      .populate({ path: 'agentId', select: '-password' })
      .lean()
      .exec();
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(
    id: string,
    dto: UpdateOrganizationDto,
  ): Promise<OrganizationDocument> {
    if (dto.title) {
      const conflict = await this.orgModel.findOne({
        title: dto.title,
        _id: { $ne: new Types.ObjectId(id) },
      });
      if (conflict) {
        throw new ConflictException(`Organization '${dto.title}' already exists`);
      }
    }

    const org = await this.orgModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate({ path: 'agentId', select: '-password' })
      .lean()
      .exec();
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async remove(id: string): Promise<void> {
    const result = await this.orgModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Organization not found');
  }
}
