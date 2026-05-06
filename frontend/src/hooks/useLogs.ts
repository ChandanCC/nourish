import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchHistory, fetchDay, addEntry, deleteEntry } from '../api/client';
import type { AddEntryPayload } from '../api/client';
import type { NutritionDay } from '../types';

export const QUERY_KEYS = {
  history: (days: number) => ['history', days] as const,
  day:     (dateKey: string) => ['day', dateKey] as const,
};

export function useHistory(days = 15) {
  return useQuery({
    queryKey: QUERY_KEYS.history(days),
    queryFn:  () => fetchHistory(days),
    staleTime: 60000,
    retry: 2,
  });
}

export function useDay(dateKey: string) {
  return useQuery({
    queryKey: QUERY_KEYS.day(dateKey),
    queryFn:  () => fetchDay(dateKey),
    staleTime: 30000,
    retry: 1,
    throwOnError: false,
  });
}

export function useAddEntry(dateKey: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddEntryPayload) => addEntry(dateKey, payload),
    onSuccess: (updatedDay: NutritionDay) => {
      qc.setQueryData(QUERY_KEYS.day(dateKey), updatedDay);
      qc.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

export function useDeleteEntry(dateKey: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => deleteEntry(dateKey, entryId),
    onSuccess: (updatedDay: NutritionDay) => {
      qc.setQueryData(QUERY_KEYS.day(dateKey), updatedDay);
      qc.invalidateQueries({ queryKey: ['history'] });
    },
  });
}
