import axios from 'axios';
import { getToken } from '../lib/auth';
import type { NutritionDay } from '../types';

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
