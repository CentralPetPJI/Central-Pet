export type Institution = {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  cnpj?: string | null;
  city: string;
  state: string;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  website?: string | null;
  verified: boolean;
  createdAt: string;
  foundedAt?: string | null;
  petsCount?: number;
};
