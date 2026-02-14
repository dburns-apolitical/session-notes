import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export function useNotes(cellId: string | null) {
  return useQuery({
    queryKey: ["notes", cellId],
    queryFn: () => apiFetch(`/api/cells/${cellId}/notes`),
    enabled: !!cellId,
  });
}

export function useAddNote(cellId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      apiFetch(`/api/cells/${cellId}/notes`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", cellId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}
