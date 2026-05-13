import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ModerationTargetType } from '../../../../generated/prisma/client';

export class CreateReportDto {
  @IsEnum(ModerationTargetType)
  @IsNotEmpty()
  targetType: ModerationTargetType;

  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
