import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth/use-auth';
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

export const useMyInstitution = () => {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, _setError] = useState<Error | null>(null);

  const fetchMyInstitution = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/institutions/me');
      setInstitution(response.data.data ?? response.data);
    } catch (_err) {
      setInstitution(null);
    } finally {
      setIsLoading(false);
    }
  };

  const { currentUser } = useAuth();

  useEffect(() => {
    // If there's no current user, clear institution and skip fetch
    if (!currentUser) {
      setInstitution(null);
      setIsLoading(false);
      return;
    }

    void fetchMyInstitution();
    // Re-fetch whenever currentUser changes (important for mock mode)
  }, [currentUser, currentUser?.id]);

  return { institution, isLoading, error, refetch: fetchMyInstitution };
};

export const fetchInstitutionById = async (id: string) => {
  const response = await api.get(`/institutions/${id}`);
  const payload = response.data && (response.data.data ?? response.data);
  return payload as Institution;
};

export const createInstitution = async (data: Partial<Institution>) => {
  const response = await api.post('/institutions', data);
  return response.data.data ?? response.data;
};

export const updateInstitution = async (data: Partial<Institution>) => {
  const response = await api.patch('/institutions/mine', data);
  return response.data.data ?? response.data;
};

export const deleteMyInstitution = async () => {
  const response = await api.delete('/institutions/me');
  return response.data;
};
