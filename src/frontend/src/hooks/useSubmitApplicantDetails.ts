import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ApplicantDetails } from '../backend';

export function useSubmitApplicantDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (details: ApplicantDetails) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitApplicantDetails(details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationStatus'] });
    },
  });
}
