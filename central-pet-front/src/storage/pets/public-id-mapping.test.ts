import { beforeEach, describe, expect, it } from 'vitest';
import { getPublicIdMappings, saveBatchPublicIdMappings } from './public-id-mapping';

describe('publicId mapping', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('cria publicIds sequenciais ao salvar em batch', () => {
    window.localStorage.setItem(
      'central-pet:public-id-mapping',
      JSON.stringify([
        { publicId: 1, backendId: 'a' },
        { publicId: 2, backendId: 'b' },
        { publicId: 3, backendId: 'c' },
        { publicId: 4, backendId: 'd' },
        { publicId: 5, backendId: 'e' },
        { publicId: 6, backendId: 'f' },
        { publicId: 7, backendId: 'g' },
      ]),
    );

    saveBatchPublicIdMappings(['h', 'i', 'j']);

    const mappings = getPublicIdMappings();
    const publicIds = mappings.map((m) => m.publicId);
    const uniquePublicIds = new Set(publicIds);

    expect(uniquePublicIds.size).toBe(publicIds.length);
    expect(mappings.find((m) => m.backendId === 'h')?.publicId).toBe(8);
    expect(mappings.find((m) => m.backendId === 'i')?.publicId).toBe(9);
    expect(mappings.find((m) => m.backendId === 'j')?.publicId).toBe(10);
  });

  it('repara duplicação de publicId já persistida', () => {
    window.localStorage.setItem(
      'central-pet:public-id-mapping',
      JSON.stringify([
        { publicId: 1, backendId: 'a' },
        { publicId: 2, backendId: 'b' },
        { publicId: 8, backendId: 'x' },
        { publicId: 8, backendId: 'y' },
        { publicId: 8, backendId: 'z' },
      ]),
    );

    const mappings = getPublicIdMappings();
    const publicIds = mappings.map((m) => m.publicId);
    const uniquePublicIds = new Set(publicIds);

    expect(uniquePublicIds.size).toBe(publicIds.length);
    expect(mappings.find((m) => m.backendId === 'x')?.publicId).toBe(8);
    expect(mappings.find((m) => m.backendId === 'y')?.publicId).toBeGreaterThan(8);
    expect(mappings.find((m) => m.backendId === 'z')?.publicId).toBeGreaterThan(8);
  });
});
