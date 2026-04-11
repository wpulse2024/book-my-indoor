import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Booking, BookingDocument, BookingStatus } from '../bookings/schemas/booking.schema';
import { Venue, VenueDocument } from '../venues/schemas/venue.schema';
import { CreateReviewDto } from './dto/create-review.dto';

const PER_PAGE = 20;

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Venue.name) private readonly venueModel: Model<VenueDocument>,
  ) {}

  async create(userId: string, dto: CreateReviewDto): Promise<ReviewDocument> {
    // 1. Verify booking belongs to this user
    const booking = await this.bookingModel
      .findOne({
        _id: new Types.ObjectId(dto.bookingId),
        userId: new Types.ObjectId(userId),
      })
      .lean()
      .exec();

    if (!booking) throw new NotFoundException('Booking not found');

    // 2. Cannot review a cancelled booking
    if (booking.status === BookingStatus.CANCELLED) {
      throw new ForbiddenException('Cannot review a cancelled booking');
    }

    // 3. venueId must match the booking
    if (booking.venueId.toString() !== dto.venueId) {
      throw new ForbiddenException('Venue does not match booking');
    }

    // 4. Create (unique index on bookingId guards against duplicate reviews)
    let review: ReviewDocument;
    try {
      review = await this.reviewModel.create({
        venueId: new Types.ObjectId(dto.venueId),
        userId: new Types.ObjectId(userId),
        bookingId: new Types.ObjectId(dto.bookingId),
        rating: dto.rating,
        comment: dto.comment,
        isAnonymous: dto.isAnonymous ?? false,
      });
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException('You have already reviewed this booking');
      }
      throw err;
    }

    // 5. Keep venue's average rating in sync
    await this.recomputeVenueRating(dto.venueId);

    return review;
  }

  async getVenueReviews(venueId: string, page = 1) {
    const skip = (page - 1) * PER_PAGE;
    const filter = { venueId: new Types.ObjectId(venueId) };

    const [items, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PER_PAGE)
        .lean()
        .exec(),
      this.reviewModel.countDocuments(filter),
    ]);

    const avg =
      total > 0
        ? items.reduce((sum: number, r: any) => sum + r.rating, 0) / items.length
        : 0;

    const mapped = items.map((r: any) => ({
      _id: r._id,
      venueId: r.venueId,
      bookingId: r.bookingId,
      rating: r.rating,
      comment: r.comment ?? '',
      createdAt: r.createdAt,
      isAnonymous: r.isAnonymous ?? false,
      userName: r.isAnonymous ? null : ((r.userId as any)?.name ?? null),
      userAvatar: r.isAnonymous ? null : ((r.userId as any)?.avatar ?? null),
      userId: r.isAnonymous ? null : (r.userId as any)?._id,
    }));

    return {
      items: mapped,
      total,
      page,
      perPage: PER_PAGE,
      totalPages: Math.ceil(total / PER_PAGE),
      averageRating: total > 0 ? Math.round(avg * 10) / 10 : null,
    };
  }

  private async recomputeVenueRating(venueId: string): Promise<void> {
    const result = await this.reviewModel
      .aggregate([
        { $match: { venueId: new Types.ObjectId(venueId) } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ])
      .exec();

    const avg = result[0]?.avg ?? 0;
    await this.venueModel.findByIdAndUpdate(venueId, {
      rating: Math.round(avg * 10) / 10,
    });
  }
}
