import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ValidateUserDto } from './dto/validate-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify-otp/register')
  verifyRegisterOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyRegisterOtp(dto.phone, dto.otp);
  }

  @Post('verify-otp/login')
  verifyLoginOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyLoginOtp(dto.phone, dto.otp);
  }

  @Post('validate-user')
  validateUser(@Body() dto: ValidateUserDto) {
    return this.authService.validateUser(dto.identifier);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user._id.toString());
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user._id.toString(), dto);
  }

  @Post('login-as/:userId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('auth:loginAsUser')
  loginAsUser(@Param('userId') userId: string) {
    return this.authService.loginAsUser(userId);
  }

  // ── Wishlist ──────────────────────────────────────────────────────────────

  @Get('wishlist')
  @UseGuards(JwtAuthGuard)
  getWishlist(@CurrentUser() user: any) {
    return this.usersService.getWishlist(user._id.toString());
  }

  @Post('wishlist/:venueId')
  @UseGuards(JwtAuthGuard)
  addToWishlist(@CurrentUser() user: any, @Param('venueId') venueId: string) {
    return this.usersService.addToWishlist(user._id.toString(), venueId);
  }

  @Delete('wishlist/:venueId')
  @UseGuards(JwtAuthGuard)
  removeFromWishlist(@CurrentUser() user: any, @Param('venueId') venueId: string) {
    return this.usersService.removeFromWishlist(user._id.toString(), venueId);
  }
}
