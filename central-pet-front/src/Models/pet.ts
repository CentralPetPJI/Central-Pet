import type { AdoptionRequestStatus } from './adoption-request-status';
import { UserProfile } from '@/Models/user.ts';

export interface Pet {
  id: number; // ID público sequencial (1, 2, 3...) - mapeado internamente para UUID do backend
  name: string;
  species: 'dog' | 'cat';
  physicalCharacteristics: string;
  behavioralCharacteristics: string;
  notes: string;
  photo: string;
  city?: string;
  state?: string;
  responsibleUserId: string;
  sourceType: 'ONG' | 'PESSOA_FISICA' | 'ADMIN';
  sourceName: string;
}

export interface Photo {
  id: number;
  url: string;
  petId: number;
  note: string;
}

export interface PetApiResponse {
  id: string;
  profilePhoto: string;
  galleryPhotos: string[];
  name: string;
  age: string;
  species: 'dog' | 'cat';
  breed: string;
  sex: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  microchipped: boolean;
  city: string;
  state: string;
  vaccinated: boolean;
  neutered: boolean;
  dewormed: boolean;
  needsHealthCare: boolean;
  physicalLimitation: boolean;
  visualLimitation: boolean;
  hearingLimitation: boolean;
  selectedPersonalities: string[];
  responsibleUserId: string;
  responsibleUser?: UserProfile;
  adoptionStatus?: string;
  sourceType: 'ONG' | 'PESSOA_FISICA' | 'ADMIN';
  sourceName: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface PetListItem {
  id: string;
  name: string;
  species: string;
  breed?: string;
  city?: string;
  state?: string;
  adoptionStatus: string;
}

export interface ReceivedAdoptionRequest {
  id: string;
  pet: {
    id: number | string;
    name: string;
    species: string;
    city: string;
    state: string;
    responsibleUserId: string;
    sourceType: 'ONG' | 'PESSOA_FISICA' | 'ADMIN';
    sourceName: string;
  };
  adopter: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
  message: string;
  responsibleContactShareConsent: boolean;
  adopterContactShareConsent: boolean;
  status: AdoptionRequestStatus;
  note?: string;
  requestedAt: string;
  updatedAt: string;
}
