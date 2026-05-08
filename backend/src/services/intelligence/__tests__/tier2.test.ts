import { describe, it, expect } from 'vitest';
import { computeBaseline, computeCV, computePatternSlope, computeTier2 } from '../tier2';
import type { DayData } from '../types';

function day(daysAgo: number, calories: number, proteinG = 120): DayData {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    date: d.toISOString().split('T')[0]!,
    calories,
    proteinG,
    proteinAdherencePct: proteinG / 160,
    trainingLogged: false,
    totalVolumeKg: null,
  };
}

describe('computeBaseline', () => {
  it('returns established baseline from 15 consistent days', () => {
    const days = Array.from({ length: 15 }, (_, i) => day(i, 1800 + (i % 3) * 20));
    const result = computeBaseline(days);
    expect(result.baselineEstablished).toBe(true);
    expect(result.baselineKcal).toBeGreaterThan(1790);
    expect(result.baselineKcal).toBeLessThan(1830);
  });

  it('returns null baseline when fewer than 7 days', () => {
    const days = [day(0, 1800), day(1, 1750), day(2, 1820)];
    const result = computeBaseline(days);
    expect(result.baselineKcal).toBeNull();
    expect(result.baselineEstablished).toBe(false);
  });

  it('suppresses high outlier from baseline computation', () => {
    const days = [
      ...Array.from({ length: 13 }, (_, i) => day(i + 1, 1850)),
      day(0, 3500), // outlier
    ];
    const result = computeBaseline(days);
    expect(result.baselineEstablished).toBe(true);
    // Baseline should be close to 1850, not pulled toward 3500
    expect(result.baselineKcal!).toBeLessThan(1950);
  });
});

describe('computeCV', () => {
  it('returns low CV for consistent calories', () => {
    const cv = computeCV([1800, 1820, 1790, 1810, 1800]);
    expect(cv).toBeLessThan(0.02);
  });

  it('returns high CV for wild variance', () => {
    const cv = computeCV([800, 2800, 1200, 3000, 500]);
    expect(cv!).toBeGreaterThan(0.25);
  });

  it('returns null for single value', () => {
    expect(computeCV([1800])).toBeNull();
  });
});

describe('computePatternSlope', () => {
  it('returns positive slope for increasing intake', () => {
    const days = [0, 1, 2, 3, 4].map(i => day(4 - i, 1700 + i * 50));
    const slope = computePatternSlope(days);
    expect(slope).toBeGreaterThan(0);
  });

  it('returns near-zero slope for flat intake', () => {
    const days = [0, 1, 2, 3, 4].map(i => day(4 - i, 1800));
    const slope = computePatternSlope(days);
    expect(Math.abs(slope!)).toBeLessThan(5);
  });

  it('returns null when fewer than 3 days', () => {
    const days = [day(0, 1800), day(1, 1820)];
    expect(computePatternSlope(days)).toBeNull();
  });
});

describe('computeTier2 — DRIFTING candidate for high variance', () => {
  it('includes DRIFTING when CV > 0.25', () => {
    const allDays = Array.from({ length: 10 }, (_, i) =>
      day(i, i % 2 === 0 ? 800 : 3000),
    );
    const tier1Mock = {
      avgCalories7d: 1900,
      avgCalories5d: 1900,
      avgProtein5d: 80,
      proteinAdherence5d: 0.5,
      loggedDaysLast14: 10,
      loggedDaysLast7: 7,
      loggedDaysLast5: 5,
      readingTriggered: false,
      underfuelledTriggered: false as boolean | null,
    };
    const result = computeTier2(allDays, allDays, tier1Mock, 160, 'maintain', 30, 0);
    expect(result.candidateStates).toContain('DRIFTING');
    expect(result.cv7d!).toBeGreaterThan(0.25);
  });
});
