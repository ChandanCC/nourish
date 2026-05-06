import axios from 'axios';
import type { NutritionDay } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Stable anonymous user ID stored in localStorage
export function getUserId(): string {
  let id = localStorage.getItem('nourish_user_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('nourish_user_id', id);
  }
  return id;
}

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Inject user ID on every request
client.interceptors.request.use(config => {
  config.headers['x-user-id'] = getUserId();
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
