import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { venueImagesUploadOptions } from '../common/upload.config';

function isAdmin(user: any): boolean {
  return user?.roles?.some((r: any) => r.name === 'admin') ?? false;
}

@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent')
  @UseInterceptors(FilesInterceptor('images', 10, venueImagesUploadOptions))
  create(
    @Body() dto: CreateVenueDto,
    @CurrentUser() user: any,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    let organizationId: string;

    if (isAdmin(user)) {
      if (!dto.organizationId) {
        throw new BadRequestException('Organization is required for admin');
      }
      organizationId = dto.organizationId;
    } else {
      if (!user.organization) {
        throw new BadRequestException('Your account is not linked to any organization');
      }
      organizationId = user.organization.toString();
    }

    const imagePaths = (images ?? []).map((f) => f.path);
    return this.venuesService.create(dto, imagePaths, organizationId);
  }

  // Public — anyone can browse venues
  @Get()
  findAll() {
    return this.venuesService.findAll();
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent')
  @UseInterceptors(FilesInterceptor('images', 10, venueImagesUploadOptions))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVenueDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    const imagePaths = (images ?? []).map((f) => f.path);
    return this.venuesService.update(id, dto, imagePaths);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent')
  remove(@Param('id') id: string) {
    return this.venuesService.remove(id);
  }
}
