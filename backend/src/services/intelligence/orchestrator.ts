import { computeTier1 } from './tier1';
import { computeTier2 } from './tier2';
import type {
  DayData, SignalComputeInput, SignalComputeResult, StateLabel, PatternQualifier,
} from './types';

function buildSubtitle(
  state: StateLabel,
  stateDays: number,
  qualifier: PatternQualifier | null,
): string | null {
  if (state === 'READING') {
    if (stateDays <= 3) return `Day ${stateDays} · Baseline forming`;
    return `Day ${stateDays} · Pattern emerging`;
  }
  const qualStr = qualifier ? ` · Pattern: ${qualifier}` : '';
  return `Day ${stateDays} of this state${qualStr}`;
}

export function computeSignal(input: SignalComputeInput): SignalComputeResult {
  const {
    allLoggedDays, window14Days,
    proteinTargetG, goal, accountAgeDays, trainingSessions7d,
  } = input;

  // P05-001: Tier 1 needs baseline context for UNDERFUELLED check.
  // Run a provisional baseline first so Tier 1 can evaluate UNDERFUELLED.
  const { computeBaseline } = require('./tier2') as typeof import('./tier2');
  const provisionalBaseline = computeBaseline(allLoggedDays);

  const tier1 = computeTier1(
    window14Days,
    provisionalBaseline.baselineKcal,
    provisionalBaseline.baselineEstablished,
  );

  // Hard stop: READING
  if (tier1.readingTriggered) {
    const loggedCount = allLoggedDays.filter(d => d.calories > 0).length;
    const subtitle = buildSubtitle('READING', Math.max(1, loggedCount), null);
    return {
      state: 'READING',
      patternQualifier: null,
      deltaPercent: null,
      baselineKcal: null,
      confidenceScore: 0,
      candidateStates: ['READING'],
      tier1,
      tier2: {
        baseline: provisionalBaseline,
        deltaPercent: null,
        cv7d: null,
        patternSlope: null,
        patternQualifier: null,
        confidenceScore: 0,
        candidateStates: ['READING'],
      },
    };
  }

  const tier2 = computeTier2(
    allLoggedDays, window14Days, tier1,
    proteinTargetG, goal, accountAgeDays, trainingSessions7d,
  );

  // Hard stop: UNDERFUELLED
  if (tier1.underfuelledTriggered === true) {
    return {
      state: 'UNDERFUELLED',
      patternQualifier: tier2.patternQualifier,
      deltaPercent: tier2.deltaPercent,
      baselineKcal: tier2.baseline.baselineKcal,
      confidenceScore: tier2.confidenceScore,
      candidateStates: ['UNDERFUELLED'],
      tier1,
      tier2,
    };
  }

  // Confidence-gated fallback: insufficient signal quality
  if (tier2.confidenceScore < 50) {
    return {
      state: 'READING',
      patternQualifier: null,
      deltaPercent: tier2.deltaPercent,
      baselineKcal: tier2.baseline.baselineKcal,
      confidenceScore: tier2.confidenceScore,
      candidateStates: tier2.candidateStates,
      tier1,
      tier2,
    };
  }

  if (tier2.confidenceScore < 60) {
    return {
      state: 'DRIFTING',
      patternQualifier: tier2.patternQualifier ?? 'irregular',
      deltaPercent: tier2.deltaPercent,
      baselineKcal: tier2.baseline.baselineKcal,
      confidenceScore: tier2.confidenceScore,
      candidateStates: tier2.candidateStates,
      tier1,
      tier2,
    };
  }

  // Tier 2 candidate states — pick highest priority (will be confirmed/overridden by Tier 3 in Phase 06)
  const candidates = tier2.candidateStates;

  let state: StateLabel = 'DRIFTING';
  const priority: StateLabel[] = [
    'PROTEIN-LIMITED', 'CUTTING', 'BUILDING', 'OPTIMISING', 'DRIFTING',
  ];
  for (const p of priority) {
    if (candidates.includes(p)) { state = p; break; }
  }

  return {
    state,
    patternQualifier: tier2.patternQualifier,
    deltaPercent: tier2.deltaPercent,
    baselineKcal: tier2.baseline.baselineKcal,
    confidenceScore: tier2.confidenceScore,
    candidateStates: candidates,
    tier1,
    tier2,
  };
}
