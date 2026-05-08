import type { DayData, Tier1Result } from './types';

export function computeTier1(
  window14Days: DayData[],
  baselineKcal: number | null,
  baselineEstablished: boolean,
): Tier1Result {
  const today = new Date().toISOString().split('T')[0];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const loggedInLast14 = window14Days.filter(d => d.calories > 0);
  const loggedDaysLast14 = loggedInLast14.length;

  const days7 = window14Days.filter(d => d.date >= sevenDaysAgoStr);
  const loggedInLast7 = days7.filter(d => d.calories > 0);
  const loggedDaysLast7 = loggedInLast7.length;

  // Last 5 logged days (most recent first)
  const last5Logged = loggedInLast14
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  const loggedDaysLast5 = last5Logged.length;

  const avgCalories7d = loggedDaysLast7 > 0
    ? loggedInLast7.reduce((s, d) => s + d.calories, 0) / loggedDaysLast7
    : null;

  const avgCalories5d = loggedDaysLast5 > 0
    ? last5Logged.reduce((s, d) => s + d.calories, 0) / loggedDaysLast5
    : null;

  const avgProtein5d = loggedDaysLast5 > 0
    ? last5Logged.reduce((s, d) => s + d.proteinG, 0) / loggedDaysLast5
    : null;

  const proteinAdherence5d = loggedDaysLast5 > 0
    ? last5Logged.reduce((s, d) => s + d.proteinAdherencePct, 0) / loggedDaysLast5
    : null;

  const readingTriggered = loggedDaysLast14 < 3;

  let underfuelledTriggered: boolean | null = null;
  if (baselineEstablished && baselineKcal !== null && avgCalories5d !== null && loggedDaysLast5 >= 3) {
    underfuelledTriggered = avgCalories5d < baselineKcal * 0.70;
  }

  return {
    avgCalories7d,
    avgCalories5d,
    avgProtein5d,
    proteinAdherence5d,
    loggedDaysLast14,
    loggedDaysLast7,
    loggedDaysLast5,
    readingTriggered,
    underfuelledTriggered,
  };
}
