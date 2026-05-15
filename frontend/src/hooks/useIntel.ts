import { useQuery } from '@tanstack/react-query';
import { fetchMealIntel, fetchSessionIntel, fetchDayIntel, fetchWeekIntel, fetchMonthIntel } from '../api/intel';

export function useMealIntel(entryId: string | null) {
  return useQuery({
    queryKey: ['intel', 'meal', entryId],
    queryFn: () => fetchMealIntel(entryId!),
    enabled: entryId !== null,
    staleTime: Infinity,
    throwOnError: false,
  });
}

export function useSessionIntel(sessionId: string | null) {
  return useQuery({
    queryKey: ['intel', 'session', sessionId],
    queryFn: () => fetchSessionIntel(sessionId!),
    enabled: sessionId !== null,
    staleTime: Infinity,
    throwOnError: false,
  });
}

export function useDayIntel(date: string | null) {
  return useQuery({
    queryKey: ['intel', 'daily', date],
    queryFn: () => fetchDayIntel(date!),
    enabled: date !== null,
    staleTime: Infinity,
    throwOnError: false,
  });
}

export function useWeekIntel(weekOf: string) {
  return useQuery({
    queryKey: ['intel', 'weekly', weekOf],
    queryFn: () => fetchWeekIntel(weekOf),
    staleTime: Infinity,
    throwOnError: false,
  });
}

export function useMonthIntel(month: string) {
  return useQuery({
    queryKey: ['intel', 'monthly', month],
    queryFn: () => fetchMonthIntel(month),
    staleTime: Infinity,
    throwOnError: false,
  });
}
