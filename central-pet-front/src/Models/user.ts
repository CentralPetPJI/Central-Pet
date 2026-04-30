export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: 'PESSOA_FISICA' | 'ONG' | 'ADMIN' | 'ROOT';
  birthDate?: string;
  cpf?: string;
  organizationName?: string;
  cnpj?: string;
  city?: string;
  state?: string;
  phone?: string;
  mobile?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  foundedAt?: string;
  createdAt: string;
  petsCount: number;
  deleted?: boolean;
  mustChangePassword?: boolean;
};

export type UpdateProfileData = {
  fullName?: string;
  birthDate?: string;
  city?: string;
  state?: string;
  organizationName?: string;
  phone?: string;
  mobile?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  foundedAt?: string;
};
