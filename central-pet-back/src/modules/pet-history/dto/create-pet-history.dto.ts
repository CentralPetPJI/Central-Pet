import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import {
  petHistoryEventTypes,
  type PetHistoryEventTypeValue,
} from '../constants/pet-histpry-event-types';

export class CreatePetHistoryDto {
  @IsUUID()
  petId: string;

  @IsString()
  @IsIn(petHistoryEventTypes)
  eventType: PetHistoryEventTypeValue;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromResponsible?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  toResponsible?: string;
}
