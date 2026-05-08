import { describe, it, expect } from 'vitest';
import { computeTier1 } from '../tier1';
import type { DayData } from '../types';

function day(date: string, calories: number, proteinG = 100): DayData {
  return {
    date,
    calories,
    proteinG,
    proteinAdherencePct: proteinG / 160,
    trainingLogged: false,
    totalVolumeKg: null,
  };
}

function datesBack(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0]!;
  });
}

describe('computeTier1', () => {
  it('triggers READING when fewer than 3 logged days in last 14', () => {
    const dates = datesBack(14);
    const days: DayData[] = [
      day(dates[0]!, 1800),
      day(dates[3]!, 1600),
    ];
    const result = computeTier1(days, null, false);
    expect(result.readingTriggered).toBe(true);
    expect(result.loggedDaysLast14).toBe(2);
  });

  it('does not trigger READING when 3+ days logged', () => {
    const dates = datesBack(14);
    const days: DayData[] = [
      day(dates[0]!, 1800),
      day(dates[1]!, 1750),
      day(dates[2]!, 1900),
    ];
    const result = computeTier1(days, null, false);
    expect(result.readingTriggered).toBe(false);
  });

  it('triggers UNDERFUELLED when avg5d < 70% of baseline with 3+ days', () => {
    const dates = datesBack(14);
    const days: DayData[] = [
      day(dates[0]!, 1100),
      day(dates[1]!, 1050),
      day(dates[2]!, 1200),
      day(dates[3]!, 900),
      day(dates[4]!, 980),
    ];
    const result = computeTier1(days, 1850, true);
    expect(result.underfuelledTriggered).toBe(true);
  });

  it('does not trigger UNDERFUELLED when avg5d >= 70% of baseline', () => {
    const dates = datesBack(14);
    const days: DayData[] = [
      day(dates[0]!, 1600),
      day(dates[1]!, 1700),
      day(dates[2]!, 1550),
      day(dates[3]!, 1680),
      day(dates[4]!, 1620),
    ];
    const result = computeTier1(days, 1850, true);
    expect(result.underfuelledTriggered).toBe(false);
  });

  it('returns null for underfuelledTriggered when baseline not established', () => {
    const dates = datesBack(14);
    const days: DayData[] = [
      day(dates[0]!, 1200),
      day(dates[1]!, 1100),
      day(dates[2]!, 1000),
    ];
    const result = computeTier1(days, null, false);
    expect(result.underfuelledTriggered).toBeNull();
  });

  it('computes avgCalories7d correctly', () => {
    const dates = datesBack(7);
    const days: DayData[] = dates.map((d, i) => day(d, 1800 + i * 10));
    const result = computeTier1(days, null, false);
    expect(result.avgCalories7d).toBeCloseTo(1830, 0);
  });
});
