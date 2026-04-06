import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignRolesDto {
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  roles!: string[];
}
