import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import moment from 'moment';
import { BookingStatus, PaymentStatus, SlotStatus, VenueSlot, VenueSlotDocument } from './schemas/venue-slot.schema';
import { Venue, VenueDocument } from '../venues/schemas/venue.schema';
import { COMMISSION_TYPE, Organization, OrganizationDocument } from '../organizations/schemas/organization.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role, RoleDocument } from '../roles/schemas/role.schema';
import { CreateVenueSlotDto } from './dto/create-venue-slot.dto';
import { CreateBulkVenueSlotsDto } from './dto/create-bulk-venue-slots.dto';
import { UpdateVenueSlotDto } from './dto/update-venue-slot.dto';
import { UpdateSlotStatusDto } from './dto/update-slot-status.dto';
import { BookSlotByAgentDto } from './dto/book-slot-by-agent.dto';
import { FindVenueSlotsQueryDto } from './dto/find-venue-slots-query.dto';
import { BulkUpdateVenueSlotsDto } from './dto/bulk-update-venue-slots.dto';
import { BulkDeleteVenueSlotsDto } from './dto/bulk-delete-venue-slots.dto';
import { BulkUpdateSlotStatusDto } from './dto/bulk-update-slot-status.dto';

@Injectable()
export class VenueSlotsService {
  constructor(
    @InjectModel(VenueSlot.name)
    private readonly venueSlotModel: Model<VenueSlotDocument>,
    @InjectModel(Venue.name)
    private readonly venueModel: Model<VenueDocument>,
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<OrganizationDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  private parseDate(date: string): Date {
    return moment(date, 'YYYY-MM-DD').startOf('day').toDate();
  }

  private async assertDraft(filter: Record<string, any>, notFoundMessage: string): Promise<void> {
    const slot = await this.venueSlotModel.findOne(filter).lean().exec();
    if (!slot) throw new NotFoundException(notFoundMessage);
    if (slot.status !== SlotStatus.DRAFT) {
      throw new BadRequestException('Venue slot can only be modified when in draft status');
    }
  }

  private buildFilter(
    query: FindVenueSlotsQueryDto,
    base: Record<string, any> = {},
  ): Record<string, any> {
    const filter = { ...base };
    if (query.venueId) filter.venueId = query.venueId;
    if (query.date) filter.date = this.parseDate(query.date);
    if (query.status) filter.status = query.status;
    if (query.bookingStatus) filter.bookingStatus = query.bookingStatus;
    return filter;
  }

  // ─── Agent create ────────────────────────────────────────────────────────────

  create(dto: CreateVenueSlotDto, organizationId: string): Promise<VenueSlotDocument> {
    const date = this.parseDate(dto.date);
    return this.venueSlotModel.create({ ...dto, date, organizationId });
  }

  // ─── Admin create — resolves organizationId from venue ──────────────────────

  async createAsAdmin(dto: CreateVenueSlotDto): Promise<VenueSlotDocument> {
    const venue = await this.venueModel.findById(dto.venueId).lean().exec();
    if (!venue) throw new NotFoundException('Venue not found');

    const date = this.parseDate(dto.date);
    return this.venueSlotModel.create({
      ...dto,
      date,
      organizationId: venue.organizationId,
    });
  }

  // ─── Agent bulk create ───────────────────────────────────────────────────────

  async createBulk(
    dto: CreateBulkVenueSlotsDto,
    organizationId: string,
  ): Promise<VenueSlotDocument[]> {
    const venue = await this.venueModel.findOne({ _id: dto.venueId, organizationId }).lean().exec();
    if (!venue) throw new NotFoundException('Venue not found or does not belong to your organization');
    if (!venue.slots?.length) throw new BadRequestException('Venue has no slots configured');

    return this.venueSlotModel.insertMany(
      this.buildBulkDocs(dto, venue.slots, venue.organizationId.toString()),
    ) as unknown as Promise<VenueSlotDocument[]>;
  }

  // ─── Admin bulk create — resolves organizationId from venue ─────────────────

  async createBulkAsAdmin(dto: CreateBulkVenueSlotsDto): Promise<VenueSlotDocument[]> {
    const venue = await this.venueModel.findById(dto.venueId).lean().exec();
    if (!venue) throw new NotFoundException('Venue not found');
    if (!venue.slots?.length) throw new BadRequestException('Venue has no slots configured');

    return this.venueSlotModel.insertMany(
      this.buildBulkDocs(dto, venue.slots, venue.organizationId.toString()),
    ) as unknown as Promise<VenueSlotDocument[]>;
  }

  private buildBulkDocs(
    dto: CreateBulkVenueSlotsDto,
    templateSlots: Array<{ startTime: string; endTime: string; price: number }>,
    organizationId: string,
  ): Record<string, any>[] {
    const start = moment(dto.startDate, 'YYYY-MM-DD').startOf('day');
    const end = moment(dto.endDate, 'YYYY-MM-DD').startOf('day');

    if (end.isBefore(start)) {
      throw new BadRequestException('endDate must be on or after startDate');
    }

    const docs: Record<string, any>[] = [];
    const cursor = start.clone();

    while (cursor.isSameOrBefore(end, 'day')) {
      const date = cursor.toDate();
      for (const slot of templateSlots) {
        docs.push({
          organizationId,
          venueId: dto.venueId,
          date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotPrice: dto.slotPrice ?? slot.price,
          status: dto.status ?? SlotStatus.PUBLISH,
        });
      }
      cursor.add(1, 'day');
    }

    return docs;
  }

  // ─── Public slot availability (no auth) ─────────────────────────────────────

  async findPublicByVenue(venueId: string, date: string): Promise<VenueSlotDocument[]> {
    const parsedDate = this.parseDate(date);
    return this.venueSlotModel
      .find({ venueId, date: parsedDate, status: SlotStatus.PUBLISH })
      .select('startTime endTime slotPrice bookingStatus date')
      .sort({ startTime: 1 })
      .lean()
      .exec() as unknown as VenueSlotDocument[];
  }

  // ─── Public: venue IDs that have at least one available slot matching filters ──

  async findVenueIdsWithAvailability(
    date?: string,
    timeFrom?: string,
    timeTo?: string,
    priceMax?: number,
  ): Promise<string[]> {
    const filter: Record<string, any> = {
      status: SlotStatus.PUBLISH,
      bookingStatus: { $ne: BookingStatus.BOOKED },
    };

    if (date) {
      filter.date = this.parseDate(date);
    }

    if (timeFrom || timeTo) {
      filter.startTime = {};
      if (timeFrom) filter.startTime.$gte = timeFrom;
      if (timeTo) filter.startTime.$lt = timeTo;
    }

    if (priceMax !== undefined) {
      filter.slotPrice = { $lte: priceMax };
    }

    const ids = await this.venueSlotModel
      .distinct('venueId', filter)
      .exec();
    return (ids as any[]).map((id) => id.toString());
  }

  // ─── Public: minimum slot price per venue ───────────────────────────────────

  async getMinPricesPerVenue(): Promise<Record<string, number>> {
    const result = await this.venueSlotModel.aggregate([
      {
        $match: {
          status: SlotStatus.PUBLISH,
          bookingStatus: { $ne: BookingStatus.BOOKED },
        },
      },
      {
        $group: {
          _id: '$venueId',
          minPrice: { $min: '$slotPrice' },
        },
      },
    ]);
    return Object.fromEntries(result.map((r: any) => [r._id.toString(), r.minPrice]));
  }

  // ─── Queries ─────────────────────────────────────────────────────────────────

  async findAll(
    query: FindVenueSlotsQueryDto,
  ): Promise<{ data: VenueSlotDocument[]; total: number; page: number; limit: number }> {
    const filter = this.buildFilter(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.venueSlotModel
        .find(filter)
        .sort({ date: 1, startTime: 1 })
        .skip(skip)
        .limit(limit)
        .populate('venueId')
        .populate('bookingInfo.userId')
        .lean()
        .exec(),
      this.venueSlotModel.countDocuments(filter),
    ]);

    return { data: data as VenueSlotDocument[], total, page, limit };
  }

  async findAllByOrganization(
    organizationId: string,
    query: FindVenueSlotsQueryDto,
  ): Promise<{ data: VenueSlotDocument[]; total: number; page: number; limit: number }> {
    const filter = this.buildFilter(query, { organizationId });
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.venueSlotModel
        .find(filter)
        .sort({ date: 1, startTime: 1 })
        .skip(skip)
        .limit(limit)
        .populate('venueId')
        .populate('bookingInfo.userId')
        .lean()
        .exec(),
      this.venueSlotModel.countDocuments(filter),
    ]);

    return { data: data as VenueSlotDocument[], total, page, limit };
  }

  async findOne(id: string): Promise<VenueSlotDocument> {
    const slot = await this.venueSlotModel
      .findById(id)
      .populate('venueId')
      .populate('bookingInfo.userId')
      .lean()
      .exec();
    if (!slot) throw new NotFoundException('Venue slot not found');
    return slot;
  }

  // ─── Agent update — org-scoped ───────────────────────────────────────────────

  async updateByOrganization(
    id: string,
    organizationId: string,
    dto: UpdateVenueSlotDto,
  ): Promise<VenueSlotDocument> {
    await this.assertDraft(
      { _id: id, organizationId },
      'Venue slot not found or does not belong to your organization',
    );

    const update: Record<string, any> = { ...dto };
    if (dto.date) update.date = this.parseDate(dto.date);

    return this.venueSlotModel
      .findOneAndUpdate({ _id: id, organizationId }, update, { new: true })
      .populate('venueId')
      .lean()
      .exec() as Promise<VenueSlotDocument>;
  }

  // ─── Agent price update — allowed on any non-booked slot ────────────────────

  async updatePriceByOrganization(
    id: string,
    organizationId: string,
    slotPrice: number,
  ): Promise<VenueSlotDocument> {
    const slot = await this.venueSlotModel.findOne({ _id: id, organizationId }).lean().exec();
    if (!slot) throw new NotFoundException('Venue slot not found or does not belong to your organization');
    if (slot.bookingStatus === BookingStatus.BOOKED) {
      throw new BadRequestException('Cannot update price of a booked slot');
    }

    return this.venueSlotModel
      .findOneAndUpdate({ _id: id, organizationId }, { slotPrice }, { new: true })
      .populate('venueId')
      .lean()
      .exec() as Promise<VenueSlotDocument>;
  }

  // ─── Admin update — resolves organizationId from venue if venueId changes ───

  async updateAsAdmin(id: string, dto: UpdateVenueSlotDto): Promise<VenueSlotDocument> {
    await this.assertDraft({ _id: id }, 'Venue slot not found');

    const update: Record<string, any> = { ...dto };
    if (dto.date) update.date = this.parseDate(dto.date);

    const slot = await this.venueSlotModel
      .findByIdAndUpdate(id, update, { new: true })
      .populate('venueId')
      .lean()
      .exec();
    if (!slot) throw new NotFoundException('Venue slot not found');
    return slot;
  }

  // ─── Publish / Unpublish ─────────────────────────────────────────────────────

  async updateStatus(id: string, dto: UpdateSlotStatusDto): Promise<VenueSlotDocument> {
    const slot = await this.venueSlotModel.findById(id).lean().exec();
    if (!slot) throw new NotFoundException('Venue slot not found');
    if (slot.bookingStatus === BookingStatus.BOOKED) {
      throw new BadRequestException('Cannot change status of a booked slot');
    }

    return this.venueSlotModel
      .findByIdAndUpdate(id, { status: dto.status }, { new: true })
      .populate('venueId')
      .lean()
      .exec() as Promise<VenueSlotDocument>;
  }

  async updateStatusByOrganization(
    id: string,
    organizationId: string,
    dto: UpdateSlotStatusDto,
  ): Promise<VenueSlotDocument> {
    const slot = await this.venueSlotModel.findOne({ _id: id, organizationId }).lean().exec();
    if (!slot) throw new NotFoundException('Venue slot not found or does not belong to your organization');
    if (slot.bookingStatus === BookingStatus.BOOKED) {
      throw new BadRequestException('Cannot change status of a booked slot');
    }

    return this.venueSlotModel
      .findOneAndUpdate({ _id: id, organizationId }, { status: dto.status }, { new: true })
      .populate('venueId')
      .lean()
      .exec() as Promise<VenueSlotDocument>;
  }

  // ─── Booking ─────────────────────────────────────────────────────────────────

  async bookByAgent(
    id: string,
    organizationId: string,
    dto: BookSlotByAgentDto,
  ): Promise<VenueSlotDocument> {
    const slot = await this.venueSlotModel.findOne({ _id: id, organizationId }).lean().exec();
    if (!slot) throw new NotFoundException('Venue slot not found or does not belong to your organization');
    this.assertBookable(slot);

    const user = await this.findOrCreateUserByPhone(dto.userPhone);
    const { commissionAmount, totalAmount } = await this.calculateAmounts(
      slot.organizationId.toString(),
      slot.slotPrice,
    );

    const bookingInfo = this.buildBookingInfo(user._id.toString());

    return this.venueSlotModel
      .findOneAndUpdate(
        {
          _id: id,
          status: SlotStatus.PUBLISH,
          bookingStatus: {
            $ne: BookingStatus.BOOKED
          }
        },
        {
          bookingStatus: BookingStatus.BOOKED,
          commissionAmount,
          totalAmount,
          bookingInfo,
        },
        { new: true },
      )
      .populate('venueId')
      .populate('bookingInfo.userId')
      .lean()
      .exec() as Promise<VenueSlotDocument>;
  }

  async bookByUser(id: string, userId: string): Promise<VenueSlotDocument> {
    const slot = await this.venueSlotModel.findById(id).lean().exec();
    if (!slot) throw new NotFoundException('Venue slot not found');
    this.assertBookable(slot);

    const { commissionAmount, totalAmount } = await this.calculateAmounts(
      slot.organizationId.toString(),
      slot.slotPrice,
    );

    const bookingInfo = this.buildBookingInfo(userId);

    return this.venueSlotModel
      .findOneAndUpdate(
        {
          _id: id,
          status: SlotStatus.PUBLISH,
          bookingStatus: {
            $ne: BookingStatus.BOOKED
          }
        },
        {
          bookingStatus: BookingStatus.BOOKED,
          commissionAmount,
          totalAmount,
          bookingInfo,
        },
        { new: true },
      )
      .populate('venueId')
      .populate('bookingInfo.userId')
      .lean()
      .exec() as Promise<VenueSlotDocument>;
  }

  private assertBookable(slot: any): void {
    if (slot.status !== SlotStatus.PUBLISH) {
      throw new BadRequestException('Slot is not available for booking');
    }
    if (slot.bookingStatus === BookingStatus.BOOKED) {
      throw new BadRequestException('Slot is already booked');
    }
  }

  private async calculateAmounts(
    organizationId: string,
    slotPrice: number,
  ): Promise<{ commissionAmount: number; totalAmount: number }> {
    const org = await this.organizationModel.findById(organizationId).lean().exec();
    if (!org) throw new NotFoundException('Organization not found');

    const commissionAmount =
      org.commissionType === COMMISSION_TYPE.percentage
        ? Math.round(slotPrice * (org.commissionAmount / 100) * 100) / 100
        : org.commissionAmount;

    return { commissionAmount, totalAmount: slotPrice + commissionAmount };
  }

  private buildBookingInfo(userId: string) {
    return {
      userId,
      paymentStatus: PaymentStatus.PENDING_FOR_PAYMENT,
      bookingTime: new Date(),
    };
  }

  private async findOrCreateUserByPhone(phone: string): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ phone }).exec();
    if (existing) return existing;

    const userRole = await this.roleModel.findOne({ name: 'user' }).lean().exec();
    return this.userModel.create({
      phone,
      isActive: true,
      roles: userRole ? [userRole._id] : [],
    });
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────

  async remove(id: string): Promise<void> {
    await this.assertDraft({ _id: id }, 'Venue slot not found');
    await this.venueSlotModel.findByIdAndDelete(id);
  }

  async removeByOrganization(id: string, organizationId: string): Promise<void> {
    await this.assertDraft(
      { _id: id, organizationId },
      'Venue slot not found or does not belong to your organization',
    );
    await this.venueSlotModel.findOneAndDelete({ _id: id, organizationId });
  }

  // ─── Bulk Update ─────────────────────────────────────────────────────────────

  async bulkUpdateByOrganization(
    organizationId: string,
    dto: BulkUpdateVenueSlotsDto,
  ): Promise<{ modifiedCount: number }> {
    const update: Record<string, any> = {};
    if (dto.slotPrice !== undefined) update.slotPrice = dto.slotPrice;

    if (!Object.keys(update).length) {
      throw new BadRequestException('No fields provided to update');
    }

    const result = await this.venueSlotModel.updateMany(
      { _id: { $in: dto.ids }, organizationId, status: SlotStatus.DRAFT },
      { $set: update },
    );

    return { modifiedCount: result.modifiedCount };
  }

  // ─── Bulk Delete ─────────────────────────────────────────────────────────────

  async bulkRemoveByOrganization(
    organizationId: string,
    dto: BulkDeleteVenueSlotsDto,
  ): Promise<{ deletedCount: number }> {
    const result = await this.venueSlotModel.deleteMany({
      _id: { $in: dto.ids },
      organizationId,
      status: SlotStatus.DRAFT,
    });

    return { deletedCount: result.deletedCount };
  }

  // ─── Bulk Status Update ───────────────────────────────────────────────────────

  async bulkUpdateStatusByOrganization(
    organizationId: string,
    dto: BulkUpdateSlotStatusDto,
  ): Promise<{ modifiedCount: number }> {
    // Never touch booked slots regardless of requested status
    const result = await this.venueSlotModel.updateMany(
      {
        _id: { $in: dto.ids },
        organizationId,
        bookingStatus: { $ne: BookingStatus.BOOKED },
      },
      { $set: { status: dto.status } },
    );

    return { modifiedCount: result.modifiedCount };
  }
}
