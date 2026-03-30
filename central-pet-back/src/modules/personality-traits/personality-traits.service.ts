import { Injectable } from '@nestjs/common';

export interface PersonalityTrait {
  id: string;
  title: string;
  description: string;
  conflictsWith: string[];
}

@Injectable()
export class PersonalityTraitsService {
  private readonly personalityTraits: PersonalityTrait[] = [
    {
      id: 'playful',
      title: 'Brincalhao',
      description:
        'Adora interagir, correr e transformar qualquer momento em diversao.',
      conflictsWith: [],
    },
    {
      id: 'calm',
      title: 'Calmo',
      description:
        'Prefere rotinas tranquilas, cochilos longos e ambientes serenos.',
      conflictsWith: [],
    },
    {
      id: 'protective',
      title: 'Protetor',
      description: 'Se apega rapido a familia e fica sempre atento ao redor.',
      conflictsWith: [],
    },
    {
      id: 'curious',
      title: 'Curioso',
      description: 'Explora cantos novos, cheira tudo e gosta de novidades.',
      conflictsWith: [],
    },
    {
      id: 'independent',
      title: 'Independente',
      description: 'Gosta de autonomia e costuma decidir o proprio ritmo.',
      conflictsWith: [],
    },
    {
      id: 'friendly',
      title: 'Sociavel',
      description:
        'Recebe bem visitas, outros pets e busca companhia com facilidade.',
      conflictsWith: [],
    },
  ];

  findAll() {
    return {
      message: 'Personality traits retrieved successfully',
      data: this.personalityTraits,
    };
  }

  getAllTraits(): PersonalityTrait[] {
    return this.personalityTraits;
  }

  getTraitIds(): string[] {
    return this.personalityTraits.map((trait) => trait.id);
  }
}
