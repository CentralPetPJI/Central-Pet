import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import {
  ModerationTargetType,
  type ModerationTargetType as ModerationTargetTypeValue,
} from '../moderation-target-type';

export class CreateReportDto {
  @IsEnum(ModerationTargetType)
  @IsNotEmpty()
  targetType: ModerationTargetTypeValue;

  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
