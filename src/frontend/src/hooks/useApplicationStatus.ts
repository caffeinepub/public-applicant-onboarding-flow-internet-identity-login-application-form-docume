import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ApplicationStatusResponse } from '../backend';

export function useApplicationStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<ApplicationStatusResponse>({
    queryKey: ['applicationStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getApplicationStatus();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    applicationStatus: query.data,
    isLoading: actorFetching || query.isLoading,
  };
}
