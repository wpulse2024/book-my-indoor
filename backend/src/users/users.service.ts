import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { Role, RoleDocument } from '../roles/schemas/role.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existing = await this.userModel.findOne({
      $or: [
        { phone: dto.phone },
        ...(dto.email ? [{ email: dto.email }] : []),
      ],
    });
    if (existing) {
      throw new ConflictException('Phone or email already registered');
    }

    const userRole = await this.roleModel.findOne({ name: 'user' }).lean().exec();

    const user = await this.userModel.create({
      ...dto,
      password: dto.password ? (await bcrypt.hash(dto.password, 10)) : undefined,
      isActive: false,
      roles: userRole ? [userRole._id] : [],
    });

    const { password: _, ...result } = user.toObject();
    return result;
  }

  findAll(): Promise<User[]> {
    return this.userModel
      .find()
      .populate({ path: 'roles', populate: { path: 'permissions' } })
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .populate({ path: 'roles', populate: { path: 'permissions' } })
      .populate('organization')
      .lean()
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Used internally by auth — includes password */
  async findByIdentifier(identifier: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        $or: [{ phone: identifier }, { email: identifier }],
        isActive: true,
      })
      .select('+password')
      .populate({ path: 'roles', populate: { path: 'permissions' } })
      .exec();
  }

  async assignRoles(id: string, dto: AssignRolesDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { roles: dto.roles }, { new: true })
      .populate({ path: 'roles', populate: { path: 'permissions' } })
      .lean()
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone }).select('+password').exec();
  }

  async activateUser(phone: string): Promise<void> {
    await this.userModel.updateOne({ phone }, { $set: { isActive: true } });
  }

  async updateProfile(id: string, data: { name?: string; email?: string }): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate({ path: 'roles', populate: { path: 'permissions' } })
      .lean()
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('User not found');
  }

  async getWishlist(userId: string): Promise<any[]> {
    const user = await this.userModel
      .findById(userId)
      .populate('wishlist')
      .lean()
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return (user as any).wishlist ?? [];
  }

  async addToWishlist(userId: string, venueId: string): Promise<{ wishlisted: boolean }> {
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { wishlist: venueId },
    });
    return { wishlisted: true };
  }

  async removeFromWishlist(userId: string, venueId: string): Promise<{ wishlisted: boolean }> {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { wishlist: venueId },
    });
    return { wishlisted: false };
  }
}
