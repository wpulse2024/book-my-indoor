import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { VenueFeaturesService } from './venue-features.service';
import { CreateVenueFeatureDto } from './dto/create-venue-feature.dto';
import { UpdateVenueFeatureDto } from './dto/update-venue-feature.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('venue-features')
export class VenueFeaturesController {
  constructor(private readonly venueFeaturesService: VenueFeaturesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-features:create')
  create(@Body() dto: CreateVenueFeatureDto) {
    return this.venueFeaturesService.create(dto);
  }

  // Public — anyone can browse venue features
  @Get()
  findAll() {
    return this.venueFeaturesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.venueFeaturesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-features:update')
  update(@Param('id') id: string, @Body() dto: UpdateVenueFeatureDto) {
    return this.venueFeaturesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venue-features:delete')
  remove(@Param('id') id: string) {
    return this.venueFeaturesService.remove(id);
  }
}
