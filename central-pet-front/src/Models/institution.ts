export type Institution = {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  email?: string | null;
  createdAt?: string;
  foundedAt?: string | null; // quando disponível
  birthDate?: string | null; // para ONGs podemos usar como data de fundação
  petsCount?: number;
};
