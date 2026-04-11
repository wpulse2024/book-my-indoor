import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { organizationLogoUploadOptions } from '../common/upload.config';

@Controller('organizations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @RequirePermissions('organizations:create')
  @UseInterceptors(FileInterceptor('logo', organizationLogoUploadOptions))
  create(
    @Body() dto: CreateOrganizationDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return this.organizationsService.create(dto, logo?.path);
  }

  @Get()
  @RequirePermissions('organizations:read')
  findAll() {
    return this.organizationsService.findAll();
  }

  // ─── Staff endpoints (agent-scoped) — must be before :id to avoid conflict ───

  @Get('my-staff')
  @RequirePermissions('staff:read')
  getMyStaff(@CurrentUser() user: any) {
    return this.organizationsService.getMyStaff(user._id.toString());
  }

  @Post('staff')
  @RequirePermissions('staff:create')
  addStaff(@CurrentUser() user: any, @Body() dto: CreateStaffDto) {
    return this.organizationsService.addStaff(user._id.toString(), dto);
  }

  @Delete('staff/:staffUserId')
  @RequirePermissions('staff:delete')
  removeStaff(@CurrentUser() user: any, @Param('staffUserId') staffUserId: string) {
    return this.organizationsService.removeStaff(user._id.toString(), staffUserId);
  }

  @Get(':id')
  @RequirePermissions('organizations:singleRead')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('organizations:update')
  @UseInterceptors(FileInterceptor('logo', organizationLogoUploadOptions))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return this.organizationsService.update(id, dto, logo?.path);
  }

  @Delete(':id')
  @RequirePermissions('organizations:delete')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
