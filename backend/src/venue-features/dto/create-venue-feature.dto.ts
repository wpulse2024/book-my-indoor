import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVenueFeatureDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  icon!: string;
}
