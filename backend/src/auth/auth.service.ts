import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    return this.usersService.create(dto);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByIdentifier(dto.identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: (user._id as any).toString(),
      phone: user.phone,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }
}
