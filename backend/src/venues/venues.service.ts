import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Venue, VenueDocument } from './schemas/venue.schema';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Injectable()
export class VenuesService {
  constructor(
    @InjectModel(Venue.name)
    private readonly venueModel: Model<VenueDocument>,
  ) {}

  create(dto: CreateVenueDto, imagePaths: string[], organizationId: string): Promise<VenueDocument> {
    return this.venueModel.create({ ...dto, images: imagePaths, organizationId });
  }

  findAll(): Promise<VenueDocument[]> {
    return this.venueModel
      .find()
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

  async remove(id: string): Promise<void> {
    const result = await this.venueModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Venue not found');
  }
}
