/**
 * Formatadores de dados para exibição
 */

/**
 * Formata espécie de animal para português
 * @param species - Código da espécie (ex: 'DOG', 'CAT', 'Cachorro', 'Gato')
 * @returns Espécie formatada em português
 */
export function formatPetSpecies(species: string): string {
  const normalized = species?.trim();
  const speciesMap: Record<string, string> = {
    DOG: 'Cachorro',
    dog: 'Cachorro',
    Cachorro: 'Cachorro',
    cachorro: 'Cachorro',
    CAT: 'Gato',
    cat: 'Gato',
    Gato: 'Gato',
    gato: 'Gato',
  };

  return speciesMap[normalized] ?? species;
}
