import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => apiFetch(`/api/projects/${id}`),
    enabled: !!id,
  });
}

export function useAddSong(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch(`/api/projects/${projectId}/songs`, {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

export function useAddStep(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch(`/api/projects/${projectId}/steps`, {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

export function useToggleCell(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cellId, isComplete }: { cellId: string; isComplete: boolean }) =>
      apiFetch(`/api/cells/${cellId}`, {
        method: "PATCH",
        body: JSON.stringify({ isComplete }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}
