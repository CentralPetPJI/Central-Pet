import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { ReceivedAdoptionRequest } from '@/Models/pet';

type UseAdoptionRequestsSentParams = {
  currentUserId?: string;
  isAuthLoading: boolean;
};

export function useAdoptionRequestsSent({
  currentUserId,
  isAuthLoading,
}: UseAdoptionRequestsSentParams) {
  const [requests, setRequests] = useState<ReceivedAdoptionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestIdRef = useRef<number>(0);

  const loadRequests = useCallback(async (userId: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;

    try {
      const response = await api.get<{ data: ReceivedAdoptionRequest[] }>('/adoption-requests', {
        params: {
          type: 'sent',
          adopterId: userId,
        },
      });

      if (currentRequestId === requestIdRef.current) {
        setRequests(response.data.data);
      }
    } catch {
      if (currentRequestId === requestIdRef.current) {
        setErrorMessage('Não foi possível carregar as solicitações enviadas no momento.');
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!currentUserId) {
      setIsLoading(false);
      setErrorMessage(null);
      setRequests([]);
      return;
    }

    void loadRequests(currentUserId);
  }, [currentUserId, isAuthLoading, loadRequests]);

  return {
    requests,
    isLoading,
    errorMessage,
    loadRequests: () => currentUserId && loadRequests(currentUserId),
  };
}
