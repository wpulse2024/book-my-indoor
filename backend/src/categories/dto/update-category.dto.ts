import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  image?: string;
}
