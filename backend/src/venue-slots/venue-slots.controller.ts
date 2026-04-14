import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VenueSlotsService } from './venue-slots.service';
import { CreateVenueSlotDto } from './dto/create-venue-slot.dto';
import { CreateBulkVenueSlotsDto } from './dto/create-bulk-venue-slots.dto';
import { UpdateVenueSlotDto } from './dto/update-venue-slot.dto';
import { UpdateSlotStatusDto } from './dto/update-slot-status.dto';
import { BookSlotByAgentDto } from './dto/book-slot-by-agent.dto';
import { FindVenueSlotsQueryDto } from './dto/find-venue-slots-query.dto';
import { BulkUpdateVenueSlotsDto } from './dto/bulk-update-venue-slots.dto';
import { BulkDeleteVenueSlotsDto } from './dto/bulk-delete-venue-slots.dto';
import { BulkUpdateSlotStatusDto } from './dto/bulk-update-slot-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('venue-slots')
export class VenueSlotsController {
  constructor(private readonly venueSlotsService: VenueSlotsService) {}

  // Agent — creates a slot under their own organization
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:create')
  create(@Body() dto: CreateVenueSlotDto, @CurrentUser() user: any) {
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    return this.venueSlotsService.create(dto, user.organization.toString());
  }

  // Admin — organizationId resolved from the venue
  @Post('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:adminCreate')
  createAsAdmin(@Body() dto: CreateVenueSlotDto) {
    return this.venueSlotsService.createAsAdmin(dto);
  }

  // Agent — bulk create slots from venue's slot templates across a date range
  @Post('bulk')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:create')
  createBulk(@Body() dto: CreateBulkVenueSlotsDto, @CurrentUser() user: any) {
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    return this.venueSlotsService.createBulk(dto, user.organization.toString());
  }

  // Admin — bulk create slots; organizationId resolved from the venue
  @Post('admin/bulk')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:adminCreate')
  createBulkAsAdmin(@Body() dto: CreateBulkVenueSlotsDto) {
    return this.venueSlotsService.createBulkAsAdmin(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:readAll')
  findAll(@Query() query: FindVenueSlotsQueryDto) {
    return this.venueSlotsService.findAll(query);
  }

  // Agent — list slots belonging to their own organization
  @Get('mine')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:readMine')
  findMine(@Query() query: FindVenueSlotsQueryDto, @CurrentUser() user: any) {
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    return this.venueSlotsService.findAllByOrganization(user.organization.toString(), query);
  }

  // Public — returns published slots for a venue on a given date (no auth)
  @Get('public')
  findPublic(
    @Query('venueId') venueId: string,
    @Query('date') date: string,
  ) {
    if (!venueId || !date) {
      throw new BadRequestException('venueId and date are required');
    }
    return this.venueSlotsService.findPublicByVenue(venueId, date);
  }

  // Public — returns venue IDs that have at least one available slot on a date (no auth)
  @Get('public/venues')
  findVenuesWithAvailability(@Query('date') date: string) {
    if (!date) {
      throw new BadRequestException('date is required');
    }
    return this.venueSlotsService.findVenueIdsWithAvailability(date);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:readMine')
  findOne(@Param('id') id: string) {
    return this.venueSlotsService.findOne(id);
  }

  // Agent — publish/unpublish a slot within their own organization
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:updateStatus')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSlotStatusDto,
    @CurrentUser() user: any,
  ) {
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    return this.venueSlotsService.updateStatusByOrganization(id, user.organization.toString(), dto);
  }

  // Admin — publish/unpublish any slot
  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:adminUpdateStatus')
  updateStatusAsAdmin(@Param('id') id: string, @Body() dto: UpdateSlotStatusDto) {
    return this.venueSlotsService.updateStatus(id, dto);
  }

  // Agent — updates price of any non-booked slot (draft, publish, or unpublish)
  @Patch(':id/price')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:update')
  updatePrice(
    @Param('id') id: string,
    @Body('slotPrice') slotPrice: number,
    @CurrentUser() user: any,
  ) {
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    return this.venueSlotsService.updatePriceByOrganization(id, user.organization.toString(), slotPrice);
  }

  // Agent — updates only slots belonging to their own organization
  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:update')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVenueSlotDto,
    @CurrentUser() user: any,
  ) {
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    return this.venueSlotsService.updateByOrganization(id, user.organization.toString(), dto);
  }

  // Admin — updates any slot; organizationId re-resolved from venue if venueId changes
  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:adminUpdate')
  updateAsAdmin(@Param('id') id: string, @Body() dto: UpdateVenueSlotDto) {
    return this.venueSlotsService.updateAsAdmin(id, dto);
  }

  // Agent — book a slot for a customer by phone number
  @Post(':id/book')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:bookByAgent')
  bookByAgent(
    @Param('id') id: string,
    @Body() dto: BookSlotByAgentDto,
    @CurrentUser() user: any,
  ) {
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    return this.venueSlotsService.bookByAgent(id, user.organization.toString(), dto);
  }

  // User — book a slot for themselves
  @Post(':id/book-user')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:book')
  bookByUser(@Param('id') id: string, @CurrentUser() user: any) {
    return this.venueSlotsService.bookByUser(id, user._id.toString());
  }

  // Agent — bulk update draft slots (e.g. price) within their own organization
  @Patch('bulk')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:update')
  bulkUpdate(@Body() dto: BulkUpdateVenueSlotsDto, @CurrentUser() user: any) {
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    return this.venueSlotsService.bulkUpdateByOrganization(user.organization.toString(), dto);
  }

  // Agent — bulk publish / unpublish slots within their own organization
  @Patch('bulk/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:updateStatus')
  bulkUpdateStatus(@Body() dto: BulkUpdateSlotStatusDto, @CurrentUser() user: any) {
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    return this.venueSlotsService.bulkUpdateStatusByOrganization(user.organization.toString(), dto);
  }

  // Agent — bulk delete draft slots within their own organization
  @Delete('bulk')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:delete')
  bulkRemove(@Body() dto: BulkDeleteVenueSlotsDto, @CurrentUser() user: any) {
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    return this.venueSlotsService.bulkRemoveByOrganization(user.organization.toString(), dto);
  }

  // Agent — deletes only slots belonging to their own organization
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:delete')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    return this.venueSlotsService.removeByOrganization(id, user.organization.toString());
  }

  // Admin — deletes any slot
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-slots:adminDelete')
  removeAsAdmin(@Param('id') id: string) {
    return this.venueSlotsService.remove(id);
  }
}
