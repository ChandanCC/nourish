import axios from 'axios';
import { getToken } from '../lib/auth';
import type { MealIntel, SessionIntel, DayIntel, WeekIntel, MonthIntel } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const client = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });
client.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

export async function fetchMealIntel(entryId: string): Promise<MealIntel> {
  const { data } = await client.get<{ data: MealIntel }>(`/intel/meal/${entryId}`);
  return data.data;
}

export async function fetchSessionIntel(sessionId: string): Promise<SessionIntel> {
  const { data } = await client.get<{ data: SessionIntel }>(`/intel/session/${sessionId}`);
  return data.data;
}

export async function fetchDayIntel(date: string): Promise<DayIntel> {
  const { data } = await client.get<{ data: DayIntel }>(`/intel/daily`, { params: { date } });
  return data.data;
}

export async function fetchWeekIntel(weekOf: string): Promise<WeekIntel> {
  const { data } = await client.get<{ data: WeekIntel }>(`/intel/weekly`, { params: { weekOf } });
  return data.data;
}

export async function fetchMonthIntel(month: string): Promise<MonthIntel> {
  const { data } = await client.get<{ data: MonthIntel }>(`/intel/monthly`, { params: { month } });
  return data.data;
}
