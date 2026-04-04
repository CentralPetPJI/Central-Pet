import { beforeEach, describe, expect, it } from '@jest/globals';
import { PersonalityTraitsController } from './personality-traits.controller';
import { PersonalityTraitsService } from './personality-traits.service';

describe('Controlador de traços de personalidade', () => {
  let controller: PersonalityTraitsController;

  beforeEach(() => {
    controller = new PersonalityTraitsController(new PersonalityTraitsService());
  });

  it('deve retornar os traços de personalidade', () => {
    const result = controller.findAll();

    expect(result.message).toBe('Personality traits retrieved successfully');
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });
});
