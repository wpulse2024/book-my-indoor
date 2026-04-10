import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VenueFeature, VenueFeatureDocument } from './schemas/venue-feature.schema';
import { CreateVenueFeatureDto } from './dto/create-venue-feature.dto';
import { UpdateVenueFeatureDto } from './dto/update-venue-feature.dto';

@Injectable()
export class VenueFeaturesService {
  constructor(
    @InjectModel(VenueFeature.name)
    private readonly venueFeatureModel: Model<VenueFeatureDocument>,
  ) {}

  async create(dto: CreateVenueFeatureDto): Promise<VenueFeatureDocument> {
    const existing = await this.venueFeatureModel.findOne({ name: dto.name });
    if (existing) throw new ConflictException(`Venue feature '${dto.name}' already exists`);
    return this.venueFeatureModel.create(dto);
  }

  findAll(): Promise<VenueFeatureDocument[]> {
    return this.venueFeatureModel.find().sort({ name: 1 }).lean().exec();
  }

  async findOne(id: string): Promise<VenueFeatureDocument> {
    const feature = await this.venueFeatureModel.findById(id).lean().exec();
    if (!feature) throw new NotFoundException('Venue feature not found');
    return feature;
  }

  async update(id: string, dto: UpdateVenueFeatureDto): Promise<VenueFeatureDocument> {
    if (dto.name) {
      const conflict = await this.venueFeatureModel.findOne({
        name: dto.name,
        _id: { $ne: new Types.ObjectId(id) },
      });
      if (conflict) throw new ConflictException(`Venue feature '${dto.name}' already exists`);
    }

    const feature = await this.venueFeatureModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
      .exec();
    if (!feature) throw new NotFoundException('Venue feature not found');
    return feature;
  }

  async remove(id: string): Promise<void> {
    const result = await this.venueFeatureModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Venue feature not found');
  }
}
