/**
 * Formatadores de dados para exibição
 */

/**
 * Formata espécie de animal para português
 * @param species - Código da espécie (ex: 'DOG', 'CAT', 'Cachorro', 'Gato')
 * @returns Espécie formatada em português
 */
export function formatPetSpecies(species: string): string {
  const speciesMap: Record<string, string> = {
    DOG: 'Cão',
    dog: 'Cão',
    Cachorro: 'Cão',
    cachorro: 'Cão',
    CAT: 'Gato',
    cat: 'Gato',
    Gato: 'Gato',
    gato: 'Gato',
  };

  return speciesMap[species] ?? species;
}
