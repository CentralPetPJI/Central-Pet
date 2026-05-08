import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';

const allowedAdoptionStatuses = ['AVAILABLE', 'ADOPTED', 'UNAVAILABLE'] as const;
const allowedSpecies = ['DOG', 'CAT'] as const;
const allowedSexes = ['MALE', 'FEMALE'] as const;
const allowedSizes = ['SMALL', 'MEDIUM', 'LARGE'] as const;
const normalizeAdoptionStatus = (value: unknown): unknown =>
  typeof value === 'string' ? value.toUpperCase() : value;
const normalizeValue = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class FindPetsQueryDto {
  @IsOptional()
  @IsUUID()
  responsibleUserId?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => normalizeAdoptionStatus(value))
  @IsIn(allowedAdoptionStatuses)
  adoptionStatus?: (typeof allowedAdoptionStatuses)[number];

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => normalizeValue(value))
  @IsIn(allowedSpecies)
  species?: (typeof allowedSpecies)[number];

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => normalizeValue(value))
  @IsIn(allowedSexes)
  sex?: (typeof allowedSexes)[number];

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => normalizeValue(value))
  @IsIn(allowedSizes)
  size?: (typeof allowedSizes)[number];

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => normalizeValue(value))
  @IsString()
  @Length(2, 2)
  state?: string;
}
