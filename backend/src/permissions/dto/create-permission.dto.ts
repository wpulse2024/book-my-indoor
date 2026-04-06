import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z_]+:[a-z_]+$/, {
    message: 'name must follow pattern resource:action (e.g. users:read)',
  })
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
