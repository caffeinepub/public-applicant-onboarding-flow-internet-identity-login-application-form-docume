import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ExternalBlob } from '../backend';

export function useUploadApplicationDocuments() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: ExternalBlob[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadApplicationDocuments(files);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationStatus'] });
    },
  });
}
