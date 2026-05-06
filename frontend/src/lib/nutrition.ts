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
  green:  { bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.3)',   text: '#34d399', bar: '#34d399' },
  yellow: { bg: 'rgba(251,191,36,0.09)',  border: 'rgba(251,191,36,0.3)',   text: '#fbbf24', bar: '#fbbf24' },
  red:    { bg: 'rgba(248,113,113,0.09)', border: 'rgba(248,113,113,0.3)',  text: '#f87171', bar: '#f87171' },
  dim:    { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)', text: '#555555', bar: '#2a2a3a' },
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

const SYSTEM_PROMPT = `You are a nutrition analysis expert. Analyze all food items and return ONLY raw JSON. Start with { end with }.

Return this exact structure (use 0 for unknowns, never omit fields):
{"items":[{"name":"","quantity":"","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"mealLabel":""}],"totals":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0},"micros":{"vitaminC":0,"vitaminD":0,"vitaminB12":0,"vitaminA":0,"vitaminE":0,"vitaminK":0,"calcium":0,"iron":0,"magnesium":0,"zinc":0,"potassium":0,"sodium":0,"omega3":0,"folate":0},"summary":""}

Rules: macros/fiber in grams, calories in kcal. Indian food = IFCT data. Low-fat milk=1.5% fat ~60kcal/100ml. mealLabel: Breakfast/Lunch/Dinner/Snack/Other. Output ONLY JSON.`;

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

export async function analyseFood(text: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 5000,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: text }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const data = await res.json();
  if (data.type === 'error') throw new Error(data.error?.message || 'API error');
  if (data.stop_reason === 'max_tokens') throw new Error('Response cut off — try a smaller meal');
  const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
  if (!textBlock?.text) throw new Error('No text in response');
  return extractJSON(textBlock.text);
}
