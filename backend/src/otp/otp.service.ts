import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Otp, OtpDocument, OtpType } from './schemas/otp.schema';


@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
  ) {}

  /**
   * Generates a 6-digit OTP, stores it (hashed) in the OTP collection,
   * and returns the plain-text OTP so the caller can send it via SMS/WhatsApp.
   */
  async createOtp(phone: string, type: OtpType, expireMinute: number): Promise<string> {
    // Invalidate any existing unused OTPs for the same phone + type
    await this.otpModel.deleteMany({ phone, type, isUsed: false });

    const plainOtp = this.generateOtp();
    const hashed = await bcrypt.hash(plainOtp, 10);

    const expiresAt = new Date(Date.now() + expireMinute * 60 * 1000);

    await this.otpModel.create({ phone, otp: hashed, type, expiresAt });

    // TODO: replace with Twilio SMS / WhatsApp delivery
    this.logger.log(`[OTP] phone=${phone} type=${type} otp=${plainOtp}`);

    return plainOtp;
  }

  /**
   * Validates the OTP for the given phone + type.
   * Marks it as used on success. Throws on failure.
   */
  async verifyOtp(phone: string, plainOtp: string, type: OtpType): Promise<void> {
    const record = await this.otpModel
      .findOne({ phone, type, isUsed: false })
      .sort({ createdAt: -1 })
      .exec();

    if (!record) {
      throw new BadRequestException('OTP not found or already used');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    const isMatch = await bcrypt.compare(plainOtp, record.otp);
    if (!isMatch) {
      throw new BadRequestException('Invalid OTP');
    }

    record.isUsed = true;
    await record.save();
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
