import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /** POST /reviews — authenticated user submits a review for a completed booking */
  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: any) {
    return this.reviewsService.create(user._id.toString(), dto);
  }

  /** GET /venues/:venueId/reviews — public paginated reviews for a venue */
  @Get('venues/:venueId/reviews')
  getVenueReviews(
    @Param('venueId') venueId: string,
    @Query('page') page = 1,
  ) {
    return this.reviewsService.getVenueReviews(venueId, Number(page));
  }
}
