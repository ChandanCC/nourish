import type {
  DayData, Tier1Result, Tier2Result,
  BaselineResult, StateLabel, PatternQualifier,
} from './types';

function mean(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stdDev(values: number[]): number {
  const m = mean(values);
  return Math.sqrt(values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length);
}

function weightedMedian(values: number[], weights: number[]): number {
  const pairs = values.map((value, i) => ({ value, weight: weights[i] }));
  pairs.sort((a, b) => a.value - b.value);
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  let cumWeight = 0;
  for (const pair of pairs) {
    cumWeight += pair.weight;
    if (cumWeight >= totalWeight / 2) return pair.value;
  }
  return pairs[pairs.length - 1]!.value;
}

export function computeBaseline(allLoggedDays: DayData[]): BaselineResult {
  const eligible = allLoggedDays
    .filter(d => d.calories > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);

  if (eligible.length < 7) {
    return { baselineKcal: null, baselineEstablished: false, loggedDaysUsed: eligible.length };
  }

  const calories = eligible.map(d => d.calories);
  const m = mean(calories);
  const sd = stdDev(calories);

  const filtered = eligible.filter(d =>
    d.calories <= m + 2 * sd &&
    d.calories >= m - 2.5 * sd,
  );

  const source = filtered.length >= 3 ? filtered : eligible;
  const today = new Date();
  const weights = source.map(d => {
    const daysAgo = Math.round((today.getTime() - new Date(d.date).getTime()) / 86400000);
    return Math.exp(-0.04 * daysAgo);
  });

  return {
    baselineKcal: Math.round(weightedMedian(source.map(d => d.calories), weights)),
    baselineEstablished: eligible.length >= 7,
    loggedDaysUsed: source.length,
  };
}

export function computeCV(calories: number[]): number | null {
  if (calories.length < 2) return null;
  const m = mean(calories);
  if (m === 0) return null;
  return stdDev(calories) / m;
}

export function computePatternSlope(days: DayData[]): number | null {
  const logged = days.filter(d => d.calories > 0);
  if (logged.length < 3) return null;
  const n = logged.length;
  const xs = logged.map((_, i) => i);
  const ys = logged.map(d => d.calories);
  const sumX = xs.reduce((s, v) => s + v, 0);
  const sumY = ys.reduce((s, v) => s + v, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i]!, 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

function classifyPattern(cv: number | null, slope: number | null): PatternQualifier | null {
  if (cv === null) return null;
  if (cv >= 0.25) return 'irregular';
  if (cv < 0.12) return 'consistent';
  if (slope !== null && slope > 5) return 'building';
  return 'consistent';
}

function computeConfidence(params: {
  loggedDaysLast7: number;
  loggedDaysLast5: number;
  baselineEstablished: boolean;
  trainingDataPresent: boolean;
  cv7d: number | null;
  loggedToday: boolean;
  daysSinceLastLog: number;
  accountAgeDays: number;
}): number {
  let score = 50;
  score += (params.loggedDaysLast7 / 7) * 20;
  score += (params.loggedDaysLast5 / 5) * 10;
  if (params.baselineEstablished) score += 10;
  if (params.trainingDataPresent) score += 5;
  if (params.cv7d !== null) score -= params.cv7d * 20;
  if (params.cv7d !== null && params.cv7d < 0.12) score += 10;
  if (params.loggedToday) score += 5;
  score -= params.daysSinceLastLog * 3;
  if (params.accountAgeDays < 14) score -= 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function computeTier2(
  allLoggedDays: DayData[],
  window14Days: DayData[],
  tier1: Tier1Result,
  proteinTargetG: number,
  goal: 'lose' | 'build' | 'maintain',
  accountAgeDays: number,
  trainingSessions7d: number,
): Tier2Result {
  const baseline = computeBaseline(allLoggedDays);

  const deltaPercent = (
    tier1.avgCalories7d !== null &&
    baseline.baselineEstablished &&
    baseline.baselineKcal !== null &&
    tier1.loggedDaysLast7 >= 4
  )
    ? Math.max(-50, Math.min(50,
        ((tier1.avgCalories7d - baseline.baselineKcal) / baseline.baselineKcal) * 100,
      ))
    : null;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const days7Calories = window14Days
    .filter(d => d.date >= sevenDaysAgo.toISOString().split('T')[0] && d.calories > 0)
    .map(d => d.calories);

  const cv7d = computeCV(days7Calories);
  const patternSlope = computePatternSlope(
    window14Days.filter(d => d.date >= sevenDaysAgo.toISOString().split('T')[0]),
  );
  const patternQualifier = classifyPattern(cv7d, patternSlope);

  const today = new Date().toISOString().split('T')[0];
  const sortedLogged = allLoggedDays
    .filter(d => d.calories > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  const lastLogDate = sortedLogged[0]?.date;
  const daysSinceLastLog = lastLogDate
    ? Math.round((Date.now() - new Date(lastLogDate).getTime()) / 86400000)
    : 99;

  const confidenceScore = computeConfidence({
    loggedDaysLast7: tier1.loggedDaysLast7,
    loggedDaysLast5: tier1.loggedDaysLast5,
    baselineEstablished: baseline.baselineEstablished,
    trainingDataPresent: trainingSessions7d > 0,
    cv7d,
    loggedToday: sortedLogged[0]?.date === today,
    daysSinceLastLog,
    accountAgeDays,
  });

  // Candidate state pre-qualification
  const candidates: StateLabel[] = [];
  const bKcal = baseline.baselineKcal ?? 0;
  const avg7d = tier1.avgCalories7d ?? 0;
  const pAdh5d = tier1.proteinAdherence5d ?? 0;

  if (baseline.baselineEstablished && bKcal > 0) {
    // PROTEIN-LIMITED pre-qualification
    if (
      pAdh5d < 0.60 &&
      (tier1.avgCalories5d ?? 0) >= bKcal * 0.80 &&
      tier1.loggedDaysLast5 >= 3
    ) {
      candidates.push('PROTEIN-LIMITED');
    }

    // CUTTING pre-qualification
    if (
      avg7d < bKcal * 0.93 &&
      pAdh5d >= 0.70 &&
      tier1.loggedDaysLast7 >= 4 &&
      (cv7d ?? 1) < 0.22
    ) {
      candidates.push('CUTTING');
    }

    // BUILDING pre-qualification
    if (
      avg7d > bKcal * 1.05 &&
      pAdh5d >= 0.70 &&
      tier1.loggedDaysLast7 >= 5 &&
      trainingSessions7d >= 2 &&
      (patternSlope ?? 0) > 0
    ) {
      candidates.push('BUILDING');
    }

    // OPTIMISING pre-qualification
    const deltaOk =
      (goal === 'lose'     && deltaPercent !== null && deltaPercent >= -25 && deltaPercent <= -3) ||
      (goal === 'build'    && deltaPercent !== null && deltaPercent >= 3   && deltaPercent <= 20) ||
      (goal === 'maintain' && deltaPercent !== null && deltaPercent >= -5  && deltaPercent <= 5);

    if (
      tier1.loggedDaysLast7 >= 4 &&
      pAdh5d >= 0.75 &&
      (cv7d ?? 1) < 0.20 &&
      deltaOk
    ) {
      candidates.push('OPTIMISING');
    }
  }

  // DRIFTING: default when no positive candidates
  if (candidates.length === 0 || (cv7d !== null && cv7d > 0.25)) {
    if (!candidates.includes('DRIFTING')) candidates.push('DRIFTING');
  }

  return {
    baseline,
    deltaPercent,
    cv7d,
    patternSlope,
    patternQualifier,
    confidenceScore,
    candidateStates: candidates,
  };
}
