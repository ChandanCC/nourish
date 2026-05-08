import axios from 'axios';
import { getToken } from '../lib/auth';
import type { NutritionDay, HomeScreenPayload, FoodEntry, UserGoal } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const AUTH_URL = BASE_URL.replace(/\/api$/, '') + '/auth';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// ── API functions used by React Query ───────────────────────────────────────

export async function fetchHistory(days = 15): Promise<NutritionDay[]> {
  const { data } = await client.get<{ data: NutritionDay[] }>('/logs', { params: { days } });
  return data.data;
}

export async function fetchDay(dateKey: string): Promise<NutritionDay> {
  const { data } = await client.get<{ data: NutritionDay }>(`/logs/${dateKey}`);
  return data.data;
}

export interface AddEntryPayload {
  rawText: string;
  summary: string;
  items: NutritionDay['entries'][number]['items'];
  totals: NutritionDay['entries'][number]['totals'];
  micros: NutritionDay['entries'][number]['micros'];
}

export async function addEntry(dateKey: string, payload: AddEntryPayload): Promise<NutritionDay> {
  const { data } = await client.post<{ data: NutritionDay }>(`/logs/${dateKey}/entries`, payload);
  return data.data;
}

export async function deleteEntry(dateKey: string, entryId: string): Promise<NutritionDay> {
  const { data } = await client.delete<{ data: NutritionDay }>(`/logs/${dateKey}/entries/${entryId}`);
  return data.data;
}

// New architecture API calls
export async function fetchHomeScreen(): Promise<HomeScreenPayload> {
  const { data } = await client.get<HomeScreenPayload>('/home');
  return data;
}

export interface LogEntryPayload {
  rawInput: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  parseNote: string | null;
  parsedByModel: string;
  confidence: string;
  sourceType: string;
  sourceId: string | null;
  idempotencyKey: string;
}

export async function logEntry(payload: LogEntryPayload): Promise<FoodEntry> {
  const { data } = await client.post<{ data: FoodEntry }>('/logs', payload, {
    headers: { 'X-Idempotency-Key': payload.idempotencyKey },
  });
  return data.data;
}

export async function deleteLogEntry(entryId: string): Promise<FoodEntry> {
  const { data } = await client.delete<{ data: FoodEntry }>(`/logs/${entryId}`);
  return data.data;
}

export async function saveOnboarding(goal: UserGoal, proteinTargetG: number): Promise<void> {
  await client.patch('/user/onboarding', { goal, protein_target: proteinTargetG });
}
