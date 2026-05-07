import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsUUID } from 'class-validator';

const allowedAdoptionStatuses = ['AVAILABLE', 'ADOPTED', 'UNAVAILABLE'] as const;
const normalizeAdoptionStatus = (value: unknown): unknown =>
  typeof value === 'string' ? value.toUpperCase() : value;

export class FindPetsQueryDto {
  @IsOptional()
  @IsUUID()
  responsibleUserId?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => normalizeAdoptionStatus(value))
  @IsIn(allowedAdoptionStatuses)
  adoptionStatus?: (typeof allowedAdoptionStatuses)[number];
}
