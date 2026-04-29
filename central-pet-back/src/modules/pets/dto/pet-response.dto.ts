import type { PetResponseRecord } from '../models/pet-record';

export class PetResponseDto {
  id!: string;
  profilePhoto!: string;
  galleryPhotos!: string[];
  name!: string;
  age!: string;
  species!: string;
  breed!: string;
  sex!: string;
  size!: string;
  microchipped!: boolean;
  city!: string;
  state!: string;
  vaccinated!: boolean;
  neutered!: boolean;
  dewormed!: boolean;
  needsHealthCare!: boolean;
  physicalLimitation!: boolean;
  visualLimitation!: boolean;
  hearingLimitation!: boolean;
  selectedPersonalities!: string[];
  responsibleUserId!: string;
  adoptionStatus!: string;
  sourceType!: string;
  sourceName!: string;
  createdAt!: string;
  updatedAt!: string;

  constructor(record: PetResponseRecord) {
    Object.assign(this, record);
  }
}
