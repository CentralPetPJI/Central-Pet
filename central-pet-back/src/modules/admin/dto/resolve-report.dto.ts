import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ModerationStatus } from '../../../../generated/prisma/enums';

export class ResolveReportDto {
  @IsEnum(ModerationStatus)
  status: ModerationStatus;

  @IsOptional()
  @IsBoolean()
  blockPet?: boolean;
}
