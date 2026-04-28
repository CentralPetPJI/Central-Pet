import { PetRecord, PetAdoptionStatus } from '../models/pet-record';
import {
  Pet as PrismaPet,
  PetStatus as PrismaPetStatus,
  PetSpecies,
  PetSex,
  PetSize,
  UserRole,
} from '../../../../generated/prisma/client';

export class PetMapper {
  static toDomain(pet: PrismaPet): PetRecord {
    return {
      id: pet.id,
      profilePhoto: pet.profilePhoto,
      galleryPhotos: this.parseJsonArray(pet.galleryPhotosJson),
      name: pet.name,
      age: pet.ageText,
      species: this.mapSpeciesToResponse(pet.species),
      breed: pet.breed,
      sex: this.mapSexToResponse(pet.sex),
      size: this.mapSizeToResponse(pet.size),
      microchipped: pet.microchipped,
      vaccinated: pet.vaccinated,
      neutered: pet.neutered,
      dewormed: pet.dewormed,
      needsHealthCare: pet.needsHealthCare,
      physicalLimitation: pet.physicalLimitation,
      visualLimitation: pet.visualLimitation,
      hearingLimitation: pet.hearingLimitation,
      selectedPersonalities: this.parseJsonArray(pet.selectedPersonalitiesJson),
      responsibleUserId: pet.responsibleUserId,
      sourceType: pet.sourceType as 'ONG' | 'PESSOA_FISICA' | undefined,
      sourceName: pet.sourceName,
      adoptionStatus: this.mapStatusToResponse(pet.status),
      createdAt: pet.createdAt.toISOString(),
      updatedAt: pet.updatedAt.toISOString(),
    };
  }

  static mapSpeciesToPersistence(species: string): PetSpecies {
    const normalized = species.toLowerCase();
    return normalized === 'cat' ? PetSpecies.CAT : PetSpecies.DOG;
  }

  static mapSexToPersistence(sex: string): PetSex {
    const normalized = sex.toLowerCase();
    return normalized === 'female' ? PetSex.FEMALE : PetSex.MALE;
  }

  static mapSizeToPersistence(size: string): PetSize {
    const normalized = size.toLowerCase();
    if (normalized === 'small') return PetSize.SMALL;
    if (normalized === 'large') return PetSize.LARGE;
    return PetSize.MEDIUM;
  }

  static mapSourceTypeToPersistence(sourceType: string): UserRole {
    return sourceType === 'ONG' ? UserRole.ONG : UserRole.PESSOA_FISICA;
  }

  private static mapSpeciesToResponse(species: PetSpecies): string {
    return species === PetSpecies.CAT ? 'cat' : 'dog';
  }

  private static mapSexToResponse(sex: PetSex): string {
    return sex === PetSex.FEMALE ? 'female' : 'male';
  }

  private static mapSizeToResponse(size: PetSize): string {
    const map: Record<PetSize, string> = {
      [PetSize.SMALL]: 'small',
      [PetSize.MEDIUM]: 'medium',
      [PetSize.LARGE]: 'large',
    };
    return map[size];
  }

  private static mapStatusToResponse(status: PrismaPetStatus): PetAdoptionStatus {
    if (status === PrismaPetStatus.PENDING_ADOPTION) return 'IN_PROCESS';
    return status as PetAdoptionStatus;
  }

  private static parseJsonArray(value: string | null): string[] {
    if (!value) return [];
    try {
      const parsed: unknown = JSON.parse(value);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item): item is string => typeof item === 'string');
    } catch {
      return [];
    }
  }
}
