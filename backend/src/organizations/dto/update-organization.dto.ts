import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { COMMISSION_TYPE } from '../schemas/organization.schema';

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(COMMISSION_TYPE)
  @IsOptional()
  commissionType?: COMMISSION_TYPE;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  commissionAmount?: number;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  place?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
