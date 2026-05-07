import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PersonalityTrait } from './interfaces/personality-trait.interface';

@Injectable()
export class PersonalityTraitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return {
      message: 'Personality traits retrieved successfully',
      data: await this.getAllTraits(),
    };
  }

  async getAllTraits(): Promise<PersonalityTrait[]> {
    const traits = await this.prisma.personalityTrait.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });

    return traits.map((trait) => ({
      id: trait.id,
      title: trait.title,
      description: trait.description,
      conflictsWith: this.parseConflicts(trait.conflictsWithJson),
    }));
  }

  async getTraitIds(): Promise<string[]> {
    const traits = await this.getAllTraits();
    return traits.map((trait) => trait.id);
  }

  private parseConflicts(value: string): string[] {
    try {
      const parsed: unknown = JSON.parse(value);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item): item is string => typeof item === 'string');
    } catch {
      return [];
    }
  }
}
