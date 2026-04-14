import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Venue, VenueDocument, VenueStatus } from './schemas/venue.schema';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { FindVenuesQueryDto } from './dto/find-venues-query.dto';

@Injectable()
export class VenuesService {
  constructor(
    @InjectModel(Venue.name)
    private readonly venueModel: Model<VenueDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  async getStats(): Promise<{ venueCount: number; playerCount: number; cityCount: number }> {
    const [venueCount, playerIds, locationTitles] = await Promise.all([
      this.venueModel.countDocuments({ status: VenueStatus.ACTIVE }),
      this.bookingModel.distinct('userId'),
      this.venueModel.distinct('location.title'),
    ]);
    return {
      venueCount,
      playerCount: playerIds.length,
      cityCount: locationTitles.length,
    };
  }

  create(dto: CreateVenueDto, imagePaths: string[], organizationId: string): Promise<VenueDocument> {
    return this.venueModel.create({ ...dto, images: imagePaths, organizationId });
  }

  findAll(query: FindVenuesQueryDto): Promise<VenueDocument[]> {
    const filter: Record<string, any> = {};
    if (query.status) filter.status = query.status;

    return this.venueModel
      .find(filter)
      .populate('categoryId')
      .populate('features')
      .lean()
      .exec();
  }

  findByOrganization(organizationId: string): Promise<VenueDocument[]> {
    return this.venueModel
      .find({ organizationId })
      .populate('categoryId')
      .populate('features')
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<VenueDocument> {
    const venue = await this.venueModel
      .findById(id)
      .populate('categoryId')
      .populate('features')
      .lean()
      .exec();
    if (!venue) throw new NotFoundException('Venue not found');
    return venue;
  }

  async update(id: string, dto: UpdateVenueDto, imagePaths?: string[]): Promise<VenueDocument> {
    const update: Record<string, any> = { ...dto };
    if (imagePaths && imagePaths.length > 0) update.images = imagePaths;

    const venue = await this.venueModel
      .findByIdAndUpdate(id, update, { new: true })
      .populate('categoryId')
      .populate('features')
      .lean()
      .exec();
    if (!venue) throw new NotFoundException('Venue not found');
    return venue;
  }

  async updateByOrganization(
    id: string,
    organizationId: string,
    dto: UpdateVenueDto,
    imagePaths?: string[],
  ): Promise<VenueDocument> {
    const update: Record<string, any> = { ...dto };
    if (imagePaths && imagePaths.length > 0) update.images = imagePaths;

    const venue = await this.venueModel
      .findOneAndUpdate({ _id: id, organizationId }, update, { new: true })
      .populate('categoryId')
      .populate('features')
      .lean()
      .exec();
    if (!venue) throw new NotFoundException('Venue not found or does not belong to your organization');
    return venue;
  }

  async remove(id: string): Promise<void> {
    const result = await this.venueModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Venue not found');
  }
}
