export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: 'PESSOA_FISICA' | 'ONG';
  birthDate?: string;
  cpf?: string;
  organizationName?: string;
  cnpj?: string;
  city?: string;
  state?: string;
  createdAt: string;
  petsCount: number;
};

export type UpdateProfileData = {
  fullName?: string;
  birthDate?: string;
  city?: string;
  state?: string;
  organizationName?: string;
};
