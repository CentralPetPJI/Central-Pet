import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PersonalityTraitsController } from './personality-traits.controller';
import { PersonalityTraitsService } from './personality-traits.service';

describe('Controlador de traços de personalidade', () => {
  let controller: PersonalityTraitsController;

  beforeEach(() => {
    const serviceMock = {
      findAll: jest.fn(async () => ({
        message: 'Personality traits retrieved successfully',
        data: [
          {
            id: 'calm',
            title: 'Calmo',
            description: 'Prefere rotinas tranquilas, cochilos longos e ambientes serenos.',
            conflictsWith: ['energetic'],
          },
        ],
      })),
    } as unknown as PersonalityTraitsService;

    controller = new PersonalityTraitsController(serviceMock);
  });

  it('deve retornar os traços de personalidade', async () => {
    const result = await controller.findAll();

    expect(result.message).toBe('Personality traits retrieved successfully');
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });
});
