import {
  ConflictException,
  ForbiddenException,
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
import { CreateStaffDto } from './dto/create-staff.dto';

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

  async create(dto: CreateOrganizationDto, logoPath?: string): Promise<OrganizationDocument> {
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
      ...(logoPath && { logo: logoPath }),
      ...(dto.place && { place: dto.place }),
      ...(dto.description && { description: dto.description }),
    });

    await this.userModel.findByIdAndUpdate(agentUser._id, {
      organization: org._id,
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
    logoPath?: string,
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
      .findByIdAndUpdate(id, { ...dto, ...(logoPath && { logo: logoPath }) }, { new: true })
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

  // ─── Staff management (agent-scoped) ────────────────────────────────────────

  async getMyStaff(currentUserId: string): Promise<UserDocument[]> {
    const org = await this.orgModel.findOne({ agentId: new Types.ObjectId(currentUserId) }).lean().exec();
    if (!org) throw new ForbiddenException('No organization found for this agent');

    return this.userModel
      .find({ organization: org._id })
      .populate({ path: 'roles', populate: { path: 'permissions' } })
      .select('-password')
      .lean()
      .exec();
  }

  async addStaff(currentUserId: string, dto: CreateStaffDto): Promise<UserDocument> {
    const org = await this.orgModel.findOne({ agentId: new Types.ObjectId(currentUserId) }).lean().exec();
    if (!org) throw new ForbiddenException('No organization found for this agent');

    const existing = await this.userModel.findOne({
      $or: [
        { phone: dto.phone },
        ...(dto.email ? [{ email: dto.email }] : []),
      ],
    });
    if (existing) throw new ConflictException('Phone or email already registered');

    // Resolve role: use provided roleId or fall back to the 'user' role
    let assignedRoleId: any;
    if (dto.roleId) {
      const role = await this.roleModel.findById(dto.roleId).lean().exec();
      if (!role) throw new NotFoundException(`Role '${dto.roleId}' not found`);
      // Prevent assigning the admin role through staff creation
      if (role.name === 'admin') throw new ForbiddenException('Cannot assign the admin role to staff');
      assignedRoleId = role._id;
    } else {
      const userRole = await this.roleModel.findOne({ name: 'user' }).lean().exec();
      assignedRoleId = userRole?._id;
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const staff = await this.userModel.create({
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      password: hashed,
      roles: assignedRoleId ? [assignedRoleId] : [],
      organization: org._id,
      isActive: true,
    });

    return this.userModel
      .findById(staff._id)
      .populate({ path: 'roles', populate: { path: 'permissions' } })
      .select('-password')
      .lean()
      .exec() as Promise<UserDocument>;
  }

  async removeStaff(currentUserId: string, staffUserId: string): Promise<void> {
    const org = await this.orgModel.findOne({ agentId: new Types.ObjectId(currentUserId) }).lean().exec();
    if (!org) throw new ForbiddenException('No organization found for this agent');

    const staffUser = await this.userModel.findOne({
      _id: new Types.ObjectId(staffUserId),
      organization: org._id,
    });
    if (!staffUser) throw new NotFoundException('Staff member not found in your organization');

    await this.userModel.findByIdAndDelete(staffUserId);
  }
}
