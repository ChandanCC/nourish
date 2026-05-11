import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchHomeScreen, fetchHomeScreenForDate, logEntry, deleteLogEntry, editLogEntry } from '../api/client';
import type { LogEntryPayload, EditEntryPayload } from '../api/client';

export const HOME_QUERY_KEY = ['home'] as const;

export function useHomeScreen() {
  return useQuery({
    queryKey: HOME_QUERY_KEY,
    queryFn: fetchHomeScreen,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    throwOnError: false,
  });
}

export function useHomeForDate(date: string | null) {
  return useQuery({
    queryKey: ['home', date],
    queryFn: () => fetchHomeScreenForDate(date!),
    enabled: date !== null,
    staleTime: 5 * 60_000, // past days don't change
    throwOnError: false,
  });
}

export function useLogEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LogEntryPayload) => logEntry(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOME_QUERY_KEY });
    },
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => deleteLogEntry(entryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOME_QUERY_KEY });
    },
  });
}

export function useEditEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditEntryPayload }) =>
      editLogEntry(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOME_QUERY_KEY });
    },
  });
}
