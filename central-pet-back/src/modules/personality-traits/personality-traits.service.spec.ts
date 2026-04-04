import { describe, expect, it } from '@jest/globals';
import { PersonalityTraitsService } from './personality-traits.service';

describe('PersonalityTraitsService', () => {
  const service = new PersonalityTraitsService();

  it('deve retornar todos os traços de personalidade', () => {
    const result = service.findAll();

    expect(result.message).toBe('Personality traits retrieved successfully');
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('deve expor ids conhecidos dos traços de personalidade', () => {
    const traitIds = service.getTraitIds();

    expect(traitIds).toContain('playful');
    expect(traitIds).toContain('calm');
    expect(traitIds).toContain('protective');
    expect(traitIds).toContain('curious');
    expect(traitIds).toContain('independent');
    expect(traitIds).toContain('friendly');
  });

  it('deve retornar traços com a estrutura esperada', () => {
    const traits = service.getAllTraits();
    const first = traits[0];

    expect(first).toBeDefined();
    expect(first.id).toBeDefined();
    expect(first.title).toBeDefined();
    expect(first.description).toBeDefined();
    expect(Array.isArray(first.conflictsWith)).toBe(true);
  });
});
