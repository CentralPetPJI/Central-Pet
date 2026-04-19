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

/**
 * Formata CPF para exibição (XXX.XXX.XXX-XX)
 * @param cpf - CPF sem formatação
 * @returns CPF formatado
 */
export function formatCpf(cpf: string | undefined): string {
  if (!cpf) return '';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ para exibição (XX.XXX.XXX/XXXX-XX)
 * @param cnpj - CNPJ sem formatação
 * @returns CNPJ formatado
 */
export function formatCnpj(cnpj: string | undefined): string {
  if (!cnpj) return '';
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata documento (CPF ou CNPJ) baseado no tipo de conta
 * @param document - CPF ou CNPJ
 * @param role - Tipo de conta ('PESSOA_FISICA' ou 'ONG')
 * @returns Documento formatado
 */
export function formatDocument(document: string | undefined, role: string): string {
  if (!document) return '';
  if (role === 'PESSOA_FISICA') return formatCpf(document);
  if (role === 'ONG') return formatCnpj(document);
  return document ?? '';
}

/**
 * Lista de estados brasileiros
 */
export const brazilianStates = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
] as const;

/**
 * Formata estado brasileiro para exibição
 * @param state - Sigla do estado (ex: 'SP')
 * @returns Nome completo do estado
 */
export function formatState(state: string | undefined): string {
  if (!state) return '';
  const found = brazilianStates.find((s) => s.value === state);
  return found?.label ?? state;
}

/**
 * Formata valor de input de documento (CPF/CNPJ) aplicando máscara e limitando dígitos.
 * Útil para usar em onChange de inputs onde queremos evitar digitação além do permitido.
 * @param raw - Valor bruto do input
 * @param role - 'PESSOA_FISICA' | 'ONG'
 */
export function formatDocumentInput(raw: string | undefined, role: string): string {
  const digits = (raw ?? '').replace(/\D/g, '');
  const limited = role === 'ONG' ? digits.slice(0, 14) : digits.slice(0, 11);
  return role === 'ONG' ? formatCnpj(limited) : formatCpf(limited);
}

/**
 * Retorna apenas os dígitos do documento (limpeza para envio ao backend).
 */
export function sanitizeDocument(raw: string | undefined): string {
  return (raw ?? '').replace(/\D/g, '');
}
