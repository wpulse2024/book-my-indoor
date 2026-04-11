import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingStatus } from './schemas/booking.schema';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createBooking(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.createBooking(dto, user._id.toString());
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getUserBookings(
    @CurrentUser() user: any,
    @Query('page') page = 1,
  ) {
    return this.bookingsService.getUserBookings(user._id.toString(), Number(page));
  }

  /** Agent/Staff — bookings for venues owned by the authenticated user's organization */
  @Get('agent')
  @UseGuards(JwtAuthGuard)
  getAgentBookings(
    @CurrentUser() user: any,
    @Query('page') page = 1,
  ) {
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    return this.bookingsService.getAgentBookings(user.organization.toString(), Number(page));
  }

  /** Agent — update booking status for a venue in the agent's organization */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateAgentBookingStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @CurrentUser() user: any,
  ) {
    if (!status || !Object.values(BookingStatus).includes(status)) {
      throw new BadRequestException(`status must be one of: ${Object.values(BookingStatus).join(', ')}`);
    }
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    return this.bookingsService.updateAgentBookingStatus(id, status, user.organization.toString());
  }

  /** Admin — all bookings across the platform */
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAllBookings(
    @Query('page') page = 1,
    @Query('status') status?: string,
  ) {
    return this.bookingsService.getAllBookings(Number(page), status);
  }

  /** Public — slot availability for a venue on a given date */
  @Get('slot-availability')
  getSlotAvailability(
    @Query('venueId') venueId: string,
    @Query('date') date: string,
  ) {
    if (!venueId || !date) {
      throw new BadRequestException('venueId and date are required');
    }
    return this.bookingsService.getSlotAvailability(venueId, date);
  }

  /** Public — guest can look up their booking by ref without authentication */
  @Get(':ref')
  getBookingByRef(@Param('ref') ref: string) {
    return this.bookingsService.getBookingByRef(ref);
  }
}
