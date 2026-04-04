import type { MockPet } from '@/mocks';
import {
  mapMockPetToPetRecord,
  mapPetRecordToPersistence,
  type PetRecord,
} from '../models/pet-record';

export const createPetRecordFromMockPet = (pet: MockPet): PetRecord => mapMockPetToPetRecord(pet);

export { mapPetRecordToPersistence };
