import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { COMMISSION_TYPE } from '../schemas/organization.schema';

export class AgentDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  phone!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(COMMISSION_TYPE)
  commissionType!: COMMISSION_TYPE;

  @IsNumber()
  @IsPositive()
  commissionAmount!: number;

  @ValidateNested()
  @Type(() => AgentDto)
  agent!: AgentDto;
}
