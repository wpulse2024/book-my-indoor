import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
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

  /** Public — guest can look up their booking by ref without authentication */
  @Get(':ref')
  getBookingByRef(@Param('ref') ref: string) {
    return this.bookingsService.getBookingByRef(ref);
  }
}
