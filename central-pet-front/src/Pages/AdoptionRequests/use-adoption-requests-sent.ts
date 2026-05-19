import { useCallback, useEffect } from 'react';
import { useAdoptionRequestsSentStore } from '@/storage/adoption-requests';

type UseAdoptionRequestsSentParams = {
  currentUserId?: string;
  isAuthLoading: boolean;
};

export function useAdoptionRequestsSent({
  currentUserId,
  isAuthLoading,
}: UseAdoptionRequestsSentParams) {
  const { actions, requests, isLoading, errorMessage } = useAdoptionRequestsSentStore();

  const loadRequests = useCallback(() => {
    if (!currentUserId) {
      return;
    }

    void actions.loadRequests(currentUserId);
  }, [actions, currentUserId]);

  useEffect(() => {
    actions.setCurrentUserId(currentUserId ?? null);

    if (isAuthLoading) {
      return;
    }

    if (!currentUserId) {
      actions.resetSessionState();
      return;
    }

    void actions.loadRequests(currentUserId);
  }, [actions, currentUserId, isAuthLoading]);

  useEffect(() => () => actions.reset(), [actions]);

  return {
    requests,
    isLoading,
    errorMessage,
    loadRequests,
  };
}
