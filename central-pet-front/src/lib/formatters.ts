/**
 * Opções padronizadas para o sistema (única fonte de verdade para tradução)
 */
export const petSpeciesOptions = [
  { value: 'dog', label: 'Cachorro' },
  { value: 'cat', label: 'Gato' },
] as const;

export const petSexOptions = [
  { value: 'male', label: 'Macho' },
  { value: 'female', label: 'Fêmea' },
] as const;

export const petSizeOptions = [
  { value: 'small', label: 'Pequeno' },
  { value: 'medium', label: 'Médio' },
  { value: 'large', label: 'Grande' },
] as const;

/**
 * Formatadores de dados para exibição utilizando as opções centralizadas
 */

export function formatPetSpecies(species: string | undefined): string {
  if (!species) return '';
  const normalized = species.toLowerCase().trim();
  const found = petSpeciesOptions.find((o) => o.value === normalized);
  return found ? found.label : species;
}

export function formatPetSex(sex: string | undefined): string {
  if (!sex) return '';
  const normalized = sex.toLowerCase().trim();
  const found = petSexOptions.find((o) => o.value === normalized);
  return found ? found.label : sex;
}

export function formatPetSize(size: string | undefined): string {
  if (!size) return '';
  const normalized = size.toLowerCase().trim();
  const found = petSizeOptions.find((o) => o.value === normalized);
  return found ? found.label : size;
}

/**
 * Formatadores de CPF e CNPJ
 */

export function formatCpf(cpf: string | undefined): string {
  if (!cpf) return '';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatCnpj(cnpj: string | undefined): string {
  if (!cnpj) return '';
  const clean = cnpj.replace(/[^\dA-Za-z]/g, '');
  if (/^\d{14}$/.test(clean)) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  if (/^[\dA-Za-z]{14}$/.test(clean)) {
    return clean.replace(
      /([\dA-Za-z]{2})([\dA-Za-z]{3})([\dA-Za-z]{3})([\dA-Za-z]{4})([\dA-Za-z]{2})/,
      '$1.$2.$3/$4-$5',
    );
  }
  return cnpj;
}

export function formatDocument(document: string | undefined, role: string): string {
  if (!document) return '';
  if (role === 'PESSOA_FISICA') return formatCpf(document);
  if (role === 'ONG') return formatCnpj(document);
  return document ?? '';
}

/**
 * Estados brasileiros
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

export function formatState(state: string | undefined): string {
  if (!state) return '';
  const found = brazilianStates.find((s) => s.value === state);
  return found?.label ?? state;
}

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

export function sanitizeDocument(_raw: string | undefined, role: string): string {
  if (!_raw) return '';
  if (role === 'PESSOA_FISICA') return _raw.replace(/\D/g, '');
  if (role === 'ONG') return _raw.replace(/[^\dA-Za-z]/g, '');
  return _raw.replace(/\D/g, '');
}

// ---------------------------------------------------------------------------
// Report status formatters
// ---------------------------------------------------------------------------

export function formatReportStatus(status: string | undefined): string {
  if (!status) return '';
  const s = String(status).toUpperCase();
  switch (s) {
    case 'PENDING':
      return 'Pendente';
    case 'APPROVED':
      return 'Aprovada';
    case 'REJECTED':
      return 'Rejeitada';
    case 'RESOLVED':
      return 'Resolvida';
    default:
      return status;
  }
}

export function reportStatusBadgeClass(status: string | undefined): string {
  const s = String(status ?? '').toUpperCase();
  switch (s) {
    case 'PENDING':
      return 'bg-amber-200 text-amber-800';
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'RESOLVED':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
