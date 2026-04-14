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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { FindVenuesQueryDto } from './dto/find-venues-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { venueImagesUploadOptions } from '../common/upload.config';

@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  // Agent — creates a venue under their own organization
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venues:create')
  @UseInterceptors(FilesInterceptor('images', 10, venueImagesUploadOptions))
  create(
    @Body() dto: CreateVenueDto,
    @CurrentUser() user: any,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    const imagePaths = (images ?? []).map((f) => f.path);
    return this.venuesService.create(dto, imagePaths, user.organization.toString());
  }

  // Admin — creates a venue under any specified organization
  @Post('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venues:adminCreate')
  @UseInterceptors(FilesInterceptor('images', 10, venueImagesUploadOptions))
  createAsAdmin(
    @Body() dto: CreateVenueDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    if (!dto.organizationId) {
      throw new BadRequestException('organizationId is required');
    }
    const imagePaths = (images ?? []).map((f) => f.path);
    return this.venuesService.create(dto, imagePaths, dto.organizationId);
  }

  // Public — platform-wide stats for the hero section
  @Get('stats')
  getStats() {
    return this.venuesService.getStats();
  }

  // Public — anyone can browse venues, optionally filter by status
  @Get()
  findAll(@Query() query: FindVenuesQueryDto) {
    return this.venuesService.findAll(query);
  }

  // Agent — returns only venues belonging to the authenticated user's organization
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: any) {
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    return this.venuesService.findByOrganization(user.organization.toString());
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.venuesService.findOne(id);
  }

  // Agent — updates only venues belonging to their own organization
  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venues:update')
  @UseInterceptors(FilesInterceptor('images', 10, venueImagesUploadOptions))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVenueDto,
    @CurrentUser() user: any,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    if (!user.organization) {
      throw new BadRequestException('Your account is not linked to any organization');
    }
    const imagePaths = (images ?? []).map((f) => f.path);
    return this.venuesService.updateByOrganization(id, user.organization.toString(), dto, imagePaths);
  }

  // Admin — updates any venue regardless of organization
  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venues:adminUpdate')
  @UseInterceptors(FilesInterceptor('images', 10, venueImagesUploadOptions))
  updateAsAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateVenueDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    const imagePaths = (images ?? []).map((f) => f.path);
    return this.venuesService.update(id, dto, imagePaths);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venues:delete')
  remove(@Param('id') id: string) {
    return this.venuesService.remove(id);
  }
}
