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
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { venueImagesUploadOptions } from '../common/upload.config';

function isAdmin(user: any): boolean {
  return user?.roles?.some((r: any) => r.name === 'admin') ?? false;
}

@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venues:create')
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.venuesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venues:update')
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('venues:delete')
  remove(@Param('id') id: string) {
    return this.venuesService.remove(id);
  }
}
