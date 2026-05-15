import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchHomeScreen, fetchHomeScreenForDate, logEntry, deleteLogEntry, editLogEntry, logTrainingSession, deleteTrainingSession, editTrainingSession } from '../api/client';
import type { LogEntryPayload, EditEntryPayload, LogTrainingPayload } from '../api/client';

export const HOME_QUERY_KEY = ['home'] as const;

export function useHomeScreen(enabled = true) {
  return useQuery({
    queryKey: HOME_QUERY_KEY,
    queryFn: fetchHomeScreen,
    enabled,
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

export function useLogTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LogTrainingPayload) => logTrainingSession(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOME_QUERY_KEY });
    },
  });
}

export function useDeleteTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTrainingSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOME_QUERY_KEY });
    },
  });
}

export function useEditTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: LogTrainingPayload }) =>
      editTrainingSession(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOME_QUERY_KEY });
    },
  });
}
