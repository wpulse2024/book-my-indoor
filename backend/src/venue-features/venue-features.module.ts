import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VenueFeature, VenueFeatureSchema } from './schemas/venue-feature.schema';
import { VenueFeaturesService } from './venue-features.service';
import { VenueFeaturesController } from './venue-features.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VenueFeature.name, schema: VenueFeatureSchema },
    ]),
  ],
  controllers: [VenueFeaturesController],
  providers: [VenueFeaturesService],
})
export class VenueFeaturesModule {}
