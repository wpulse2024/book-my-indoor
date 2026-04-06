import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @RequirePermissions('permissions:create')
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Get()
  @RequirePermissions('permissions:read')
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('permissions:singleRead')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Delete(':id')
  @RequirePermissions('permissions:delete')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
