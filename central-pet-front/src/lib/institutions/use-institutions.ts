import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Institution } from '@/Models/institution';

interface UseInstitutionsResult {
  institutions: Institution[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useInstitutions = (): UseInstitutionsResult => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInstitutions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/institutions');
      // backend may return either `data` wrapper or the array directly
      const payload = (response.data && (response.data.data ?? response.data)) as Institution[];
      setInstitutions(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setInstitutions([]);
      setError(err instanceof Error ? err : new Error('Erro ao carregar instituições'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchInstitutions();
  }, []);

  return { institutions, isLoading, error, refetch: fetchInstitutions };
};

export const fetchInstitutionById = async (id: string) => {
  const response = await api.get(`/institutions/${id}`);
  const payload = response.data && (response.data.data ?? response.data);
  return payload as Institution;
};
