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
 * Aceita apenas dígitos (CPF nunca terá letras)
 * @param cpf - CPF sem formatação
 * @returns CPF formatado ou valor original se inválido
 */
export function formatCpf(cpf: string | undefined): string {
  if (!cpf) return '';
  // Remove tudo que não for dígito
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ para exibição.
 * - CNPJ antigo: apenas dígitos (XX.XXX.XXX/XXXX-XX)
 * - CNPJ novo (a partir de 07/2026): pode ser alfanumérico (A1.B2C.3D4/0001-EF)
 *
 * A função detecta se o CNPJ contém letras:
 *   - Se só dígitos e 14 caracteres: aplica máscara tradicional
 *   - Se contém letras: aplica máscara flexível (mantém letras e dígitos, separa por blocos)
 * @param cnpj - CNPJ sem formatação
 * @returns CNPJ formatado
 */
export function formatCnpj(cnpj: string | undefined): string {
  if (!cnpj) return '';
  const clean = cnpj.replace(/[^\dA-Za-z]/g, '');
  // CNPJ tradicional: só dígitos
  if (/^\d{14}$/.test(clean)) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  // Novo CNPJ alfanumérico (exemplo: A1B2C3D40001EF)
  // Aplica máscara flexível: AA.BBB.CCC/DDDD-EE (mantendo letras e dígitos)
  // Para simplificar, divide em blocos: 2-3-3-4-2
  if (/^[\dA-Za-z]{14}$/.test(clean)) {
    return clean.replace(
      /([\dA-Za-z]{2})([\dA-Za-z]{3})([\dA-Za-z]{3})([\dA-Za-z]{4})([\dA-Za-z]{2})/,
      '$1.$2.$3/$4-$5',
    );
  }
  // Se não bate com nenhum formato esperado, retorna valor original
  return cnpj;
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
  const digits = sanitizeDocument(raw, role);
  const limited = role === 'ONG' ? digits.slice(0, 14) : digits.slice(0, 11);
  return role === 'ONG' ? formatCnpj(limited) : formatCpf(limited);
}

export function formatCnpjInput(raw: string | undefined): string {
  const digits = raw ? raw.replace(/[^\dA-Za-z]/g, '') : '';
  const limited = digits.slice(0, 14);
  return formatCnpj(limited);
}

/**
 * Retorna apenas os caracteres válidos do documento para envio ao backend.
 * - Para CPF: mantém apenas dígitos (11 dígitos)
 * - Para CNPJ: a partir de julho/2026, aceita letras (A-Z) e dígitos (alfanumérico)
 * @param _raw - Valor bruto do documento (pode conter letras, símbolos, etc.)
 * @param role - 'PESSOA_FISICA' | 'ONG'
 * @returns Documento limpo, pronto para validação/envio
 */
export function sanitizeDocument(_raw: string | undefined, role: string): string {
  if (!_raw) return '';
  if (role === 'PESSOA_FISICA') {
    // CPF: só dígitos
    return _raw.replace(/\D/g, '');
  }
  if (role === 'ONG') {
    // CNPJ: a partir de julho/2026, aceita letras e dígitos
    // Remove tudo que não for letra (A-Z, case-insensitive) ou dígito
    return _raw.replace(/[^\dA-Za-z]/g, '');
  }
  // fallback: remove tudo que não for dígito
  return _raw.replace(/\D/g, '');
}
