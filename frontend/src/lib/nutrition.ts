import type { Micros, Totals, MacroKey, StatusColor } from '../types';

export const MACRO_GOALS: Totals & { [k: string]: number } = {
  calories: 1850,
  protein:  140,
  carbs:    165,
  fat:      55,
  fiber:    30,
};

export interface MicroConfig {
  label: string;
  unit: string;
  rdi: number;
  warn: number;
  good: number;
  invert?: boolean;
}

export const MICRO_RDI: Record<keyof Micros, MicroConfig> = {
  vitaminC:   { label: 'Vitamin C',  unit: 'mg',  rdi: 90,   warn: 0.4, good: 0.8 },
  vitaminD:   { label: 'Vitamin D',  unit: 'μg',  rdi: 20,   warn: 0.4, good: 0.8 },
  vitaminB12: { label: 'B12',        unit: 'μg',  rdi: 2.4,  warn: 0.4, good: 0.8 },
  vitaminA:   { label: 'Vitamin A',  unit: 'μg',  rdi: 900,  warn: 0.4, good: 0.8 },
  vitaminE:   { label: 'Vitamin E',  unit: 'mg',  rdi: 15,   warn: 0.4, good: 0.8 },
  vitaminK:   { label: 'Vitamin K',  unit: 'μg',  rdi: 120,  warn: 0.4, good: 0.8 },
  calcium:    { label: 'Calcium',    unit: 'mg',  rdi: 1000, warn: 0.4, good: 0.8 },
  iron:       { label: 'Iron',       unit: 'mg',  rdi: 18,   warn: 0.4, good: 0.8 },
  magnesium:  { label: 'Magnesium',  unit: 'mg',  rdi: 420,  warn: 0.4, good: 0.8 },
  zinc:       { label: 'Zinc',       unit: 'mg',  rdi: 11,   warn: 0.4, good: 0.8 },
  potassium:  { label: 'Potassium',  unit: 'mg',  rdi: 3500, warn: 0.4, good: 0.8 },
  sodium:     { label: 'Sodium',     unit: 'mg',  rdi: 2300, warn: 0.5, good: 1.0, invert: true },
  omega3:     { label: 'Omega-3',    unit: 'g',   rdi: 1.6,  warn: 0.4, good: 0.8 },
  folate:     { label: 'Folate',     unit: 'μg',  rdi: 400,  warn: 0.4, good: 0.8 },
};

export const MICRO_GROUPS: Record<string, (keyof Micros)[]> = {
  Vitamins: ['vitaminC','vitaminD','vitaminB12','vitaminA','vitaminE','vitaminK','folate'],
  Minerals: ['calcium','iron','magnesium','zinc','potassium','sodium'],
  Other:    ['omega3'],
};

export const STATUS_STYLES: Record<StatusColor, { bg: string; border: string; text: string; bar: string }> = {
  green:  { bg: 'rgba(62,207,162,0.10)',  border: 'rgba(62,207,162,0.28)',  text: '#3ECFA2', bar: '#3ECFA2' },
  yellow: { bg: 'rgba(232,166,64,0.09)',  border: 'rgba(232,166,64,0.28)',  text: '#E8A640', bar: '#E8A640' },
  red:    { bg: 'rgba(232,84,84,0.09)',   border: 'rgba(232,84,84,0.28)',   text: '#E85454', bar: '#E85454' },
  dim:    { bg: '#0F0F18',                border: 'rgba(232,227,216,0.09)', text: 'rgba(232,227,216,0.22)', bar: 'rgba(232,227,216,0.09)' },
};

export function getMacroStatus(key: MacroKey, value: number): StatusColor {
  if (value <= 0) return 'dim';
  const goal = MACRO_GOALS[key];
  const pct  = value / goal;
  if (key === 'calories') {
    if (pct >= 0.85 && pct <= 1.05) return 'green';
    if (pct >= 0.70 && pct <= 1.20) return 'yellow';
    return 'red';
  }
  if (key === 'fat') {
    if (pct <= 1.0)  return pct >= 0.5 ? 'green' : 'yellow';
    return pct <= 1.3 ? 'yellow' : 'red';
  }
  if (key === 'fiber') {
    if (pct >= 0.8) return 'green';
    if (pct >= 0.4) return 'yellow';
    return 'red';
  }
  if (pct >= 0.8 && pct <= 1.15) return 'green';
  if (pct >= 0.5 && pct <= 1.35) return 'yellow';
  return 'red';
}

export function getMicroStatus(key: keyof Micros, value: number): StatusColor {
  if (value <= 0) return 'dim';
  const cfg = MICRO_RDI[key];
  const pct = value / cfg.rdi;
  if (cfg.invert) return pct > 1 ? 'red' : pct > cfg.good ? 'yellow' : 'green';
  return pct >= cfg.good ? 'green' : pct >= cfg.warn ? 'yellow' : 'red';
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(k: string): string {
  return new Date(k + 'T12:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

export function detectDateFromText(text: string): string {
  const todayKey = getTodayKey();
  if (/\byesterday\b/i.test(text)) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    return y.toISOString().split('T')[0];
  }
  const dm = text.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
  if (dm && !text.includes(':')) {
    const now = new Date();
    const yr  = dm[3] ? (parseInt(dm[3]) < 100 ? 2000 + parseInt(dm[3]) : parseInt(dm[3])) : now.getFullYear();
    const d   = new Date(yr, parseInt(dm[1]) - 1, parseInt(dm[2]));
    if (!isNaN(d.getTime()) && d <= now) return d.toISOString().split('T')[0];
  }
  return todayKey;
}


function extractJSON(raw: string) {
  try { return JSON.parse(raw.trim()); } catch {}
  const stripped = raw.replace(/```(?:json)?[\s\S]*?```/gi, '').trim();
  try { return JSON.parse(stripped); } catch {}
  let depth = 0, start = -1, end = -1;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '{') { if (depth === 0) start = i; depth++; }
    else if (raw[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (start !== -1 && end !== -1) { try { return JSON.parse(raw.slice(start, end + 1)); } catch {} }
  throw new Error('Could not parse API response');
}

export type NutritionConfidence =
  | 'recalled'
  | 'estimated'
  | 'low_confidence'
  | 'matched'
  | 'verified'
  | 'user_corrected';

export type SourceType =
  | 'personal_memory'
  | 'ai_estimate'
  | 'authoritative_db'
  | 'user_input';

export interface AnalyseResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  note: string | null;
  parsedByModel: string;
  confidence: NutritionConfidence;
  sourceType: SourceType;
  sourceId: string | null;
}

export async function analyseFood(text: string): Promise<AnalyseResult> {
  const { getToken } = await import('./auth');
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api');
  const res = await fetch(`${base}/analyse`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API ${res.status}`);
  const confidence: NutritionConfidence = (data.confidence as NutritionConfidence) ?? 'estimated';
  const sourceType: SourceType          = (data.sourceType as SourceType) ?? 'ai_estimate';
  const sourceId: string | null         = data.sourceId ?? null;
  if (data.result && typeof data.result === 'object' && !Array.isArray(data.result)) {
    return { ...data.result, parsedByModel: data.parsedByModel ?? '', confidence, sourceType, sourceId } as AnalyseResult;
  }
  const legacy = extractJSON(typeof data.result === 'string' ? data.result : JSON.stringify(data.result));
  return { ...legacy, parsedByModel: data.parsedByModel ?? '', confidence, sourceType, sourceId };
}
