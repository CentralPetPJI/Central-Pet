import type { PetRecord } from '../models/pet-record';

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
  tutor!: string;
  shelter!: string;
  city!: string;
  state!: string;
  contact!: string;
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

  constructor(record: PetRecord) {
    Object.assign(this, record);
  }
}
