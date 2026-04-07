import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
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

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({ ...dto, password: hashed });

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

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('User not found');
  }
}
