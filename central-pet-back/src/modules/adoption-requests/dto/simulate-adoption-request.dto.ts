import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export const simulateAdoptionRequestSourceTypes = ['ONG', 'PESSOA_FISICA'] as const;

export type SimulateAdoptionRequestSourceType = (typeof simulateAdoptionRequestSourceTypes)[number];

export class SimulateAdoptionRequestDto {
  @IsString()
  @IsNotEmpty()
  petId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  petName: string;

  @IsString()
  @IsNotEmpty()
  petSpecies: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  petCity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  petState?: string;

  @IsString()
  @IsNotEmpty()
  petResponsibleUserId: string;

  @IsString()
  @IsIn(simulateAdoptionRequestSourceTypes)
  @IsNotEmpty()
  petSourceType: SimulateAdoptionRequestSourceType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  petSourceName: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
