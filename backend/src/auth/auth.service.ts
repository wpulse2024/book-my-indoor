import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { OtpService } from '../otp/otp.service';
import { OtpType } from '../otp/schemas/otp.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  async register(dto: RegisterDto) {
    await this.usersService.create(dto as any);
    await this.otpService.createOtp(dto.phone, OtpType.REGISTER, +(process.env.OTP_EXPIRY_MINUTES || 0));
    return { message: 'Registration successful. OTP sent to your phone.' };
  }

  async verifyRegisterOtp(phone: string, otp: string) {
    await this.otpService.verifyOtp(phone, otp, OtpType.REGISTER);
    await this.usersService.activateUser(phone);

    const user = await this.usersService.findByPhone(phone);
    if (!user) throw new NotFoundException('User not found');

    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByIdentifier(dto.identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (dto.isOtpLogin) {
      await this.otpService.createOtp(
        user.phone,
        OtpType.LOGIN,
        +(process.env.OTP_EXPIRY_MINUTES || 10),
      );
      return { message: 'OTP sent to your phone.' };
    }

    const isMatch = await bcrypt.compare(dto.password!, user.password || '');
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueToken(user);
  }

  async verifyLoginOtp(phone: string, otp: string) {
    await this.otpService.verifyOtp(phone, otp, OtpType.LOGIN);

    const user = await this.usersService.findByPhone(phone);
    if (!user) throw new NotFoundException('User not found');

    return this.issueToken(user);
  }

  private issueToken(user: any) {
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

  async loginAsUser(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    const payload: JwtPayload = {
      sub: (user as any)._id.toString(),
      phone: user.phone,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: (user as any)._id,
        phone: user.phone,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    return this.usersService.updateProfile(userId, data);
  }

  async validateUser(identifier: string) {
    const user = await this.usersService.findByIdentifierAny(identifier);

    if (!user) {
      throw new NotFoundException('No account found with that phone number.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Your account is pending admin approval. You will be notified once it is activated.');
    }

    return {
      isOtpLogin: !!!user.password
    }
  }
}
