import { describe, expect, it } from '@jest/globals';
import { PrismaService } from '@/prisma/prisma.service';
import { PersonalityTraitsService } from './personality-traits.service';

describe('PersonalityTraitsService', () => {
  const prismaMock = {
    personalityTrait: {
      findMany: async () => [
        {
          id: 'playful',
          title: 'Brincalhão',
          description: 'Adora interagir, correr e transformar qualquer momento em diversão.',
          conflictsWithJson: [],
          iconSvg: '<svg viewBox="0 0 24 24"></svg>',
        },
        {
          id: 'calm',
          title: 'Calmo',
          description: 'Prefere rotinas tranquilas, cochilos longos e ambientes serenos.',
          conflictsWithJson: ['energetic'],
          iconSvg: '<svg viewBox="0 0 24 24"></svg>',
        },
        {
          id: 'energetic',
          title: 'Agitado',
          description: 'Tem muita energia, gosta de movimento e precisa de atividades frequentes.',
          conflictsWithJson: ['calm'],
          iconSvg: '<svg viewBox="0 0 24 24"></svg>',
        },
        {
          id: 'protective',
          title: 'Protetor',
          description: 'Se apega rápido à família e fica sempre atento ao redor.',
          conflictsWithJson: [],
          iconSvg: '<svg viewBox="0 0 24 24"></svg>',
        },
        {
          id: 'curious',
          title: 'Curioso',
          description: 'Explora cantos novos, cheira tudo e gosta de novidades.',
          conflictsWithJson: [],
          iconSvg: '<svg viewBox="0 0 24 24"></svg>',
        },
        {
          id: 'independent',
          title: 'Independente',
          description: 'Gosta de autonomia e costuma decidir o próprio ritmo.',
          conflictsWithJson: [],
          iconSvg: '<svg viewBox="0 0 24 24"></svg>',
        },
        {
          id: 'friendly',
          title: 'Sociável',
          description: 'Recebe bem visitas, outros pets e busca companhia com facilidade.',
          conflictsWithJson: ['shy'],
          iconSvg: '<svg viewBox="0 0 24 24"></svg>',
        },
        {
          id: 'shy',
          title: 'Tímido',
          description: 'Prefere ambientes calmos e precisa de tempo para se adaptar a novidades.',
          conflictsWithJson: ['friendly'],
          iconSvg: '<svg viewBox="0 0 24 24"></svg>',
        },
      ],
    },
  } as unknown as PrismaService;
  const service = new PersonalityTraitsService(prismaMock);

  it('deve retornar todos os traços de personalidade', async () => {
    const result = await service.findAll();

    expect(result.message).toBe('Personality traits retrieved successfully');
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('deve expor ids conhecidos dos traços de personalidade', async () => {
    const traitIds = await service.getTraitIds();

    expect(traitIds).toContain('playful');
    expect(traitIds).toContain('calm');
    expect(traitIds).toContain('energetic');
    expect(traitIds).toContain('protective');
    expect(traitIds).toContain('curious');
    expect(traitIds).toContain('independent');
    expect(traitIds).toContain('friendly');
  });

  it('deve retornar traços com a estrutura esperada', async () => {
    const traits = await service.getAllTraits();
    const first = traits[0];

    expect(first).toBeDefined();
    expect(first.id).toBeDefined();
    expect(first.title).toBeDefined();
    expect(first.description).toBeDefined();
    expect(first.iconSvg).toContain('<svg');
    expect(Array.isArray(first.conflictsWith)).toBe(true);
  });

  it('deve retornar conflitos armazenados como JSON', async () => {
    const traits = await service.getAllTraits();

    expect(traits.find((trait) => trait.id === 'calm')?.conflictsWith).toEqual(['energetic']);
  });
});
