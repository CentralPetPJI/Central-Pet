import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['PET', 'USER'])
  targetType: string;

  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
