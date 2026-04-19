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
  phone?: string;
  mobile?: string;
  createdAt: string;
  petsCount: number;
  instagram?: string;
  facebook?: string;
  website?: string;
  foundedAt?: string;
};

export type UpdateProfileData = {
  fullName?: string;
  birthDate?: string;
  city?: string;
  state?: string;
  phone?: string;
  mobile?: string;
};
