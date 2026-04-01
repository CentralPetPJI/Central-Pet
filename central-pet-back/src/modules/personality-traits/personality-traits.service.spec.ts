import { describe, expect, it } from '@jest/globals';
import { PersonalityTraitsService } from './personality-traits.service';

describe('PersonalityTraitsService', () => {
  const service = new PersonalityTraitsService();

  it('should return all personality traits', () => {
    const result = service.findAll();

    expect(result.message).toBe('Personality traits retrieved successfully');
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('should expose known personality trait ids', () => {
    const traitIds = service.getTraitIds();

    expect(traitIds).toContain('playful');
    expect(traitIds).toContain('calm');
    expect(traitIds).toContain('protective');
    expect(traitIds).toContain('curious');
    expect(traitIds).toContain('independent');
    expect(traitIds).toContain('friendly');
  });

  it('should return traits with expected structure', () => {
    const traits = service.getAllTraits();
    const first = traits[0];

    expect(first).toBeDefined();
    expect(first.id).toBeDefined();
    expect(first.title).toBeDefined();
    expect(first.description).toBeDefined();
    expect(Array.isArray(first.conflictsWith)).toBe(true);
  });
});
