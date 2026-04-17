import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  simulateAdoptionRequestInitialStatuses,
  type SimulateAdoptionRequestInitialStatus,
} from '../models/adoption-request-status';

export class SimulateAdoptionRequestDto {
  @IsString()
  @IsNotEmpty()
  petId: string;

  @IsString()
  @IsNotEmpty()
  petResponsibleUserId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  adopterId?: string;

  @IsOptional()
  @IsBoolean()
  adopterContactShareConsent?: boolean;

  @IsOptional()
  @IsBoolean()
  responsibleContactShareConsent?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(simulateAdoptionRequestInitialStatuses)
  @IsNotEmpty()
  initialStatus?: SimulateAdoptionRequestInitialStatus;
}
