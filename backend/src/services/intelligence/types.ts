export type StateLabel =
  | 'READING' | 'UNDERFUELLED' | 'PROTEIN-LIMITED'
  | 'DRIFTING' | 'CUTTING' | 'BUILDING' | 'OPTIMISING';

export type PatternQualifier = 'consistent' | 'building' | 'irregular';

export interface DayData {
  date: string;
  calories: number;
  proteinG: number;
  proteinAdherencePct: number;
  trainingLogged: boolean;
  totalVolumeKg: number | null;
}

export interface Tier1Result {
  avgCalories7d: number | null;
  avgCalories5d: number | null;
  avgProtein5d: number | null;
  proteinAdherence5d: number | null;
  loggedDaysLast14: number;
  loggedDaysLast7: number;
  loggedDaysLast5: number;
  readingTriggered: boolean;
  underfuelledTriggered: boolean | null;
}

export interface BaselineResult {
  baselineKcal: number | null;
  baselineEstablished: boolean;
  loggedDaysUsed: number;
}

export interface Tier2Result {
  baseline: BaselineResult;
  deltaPercent: number | null;
  cv7d: number | null;
  patternSlope: number | null;
  patternQualifier: PatternQualifier | null;
  confidenceScore: number;
  candidateStates: StateLabel[];
}

export interface SignalComputeInput {
  userId: string;
  allLoggedDays: DayData[];   // all historical days for baseline
  window14Days: DayData[];    // last 14 calendar days for Tier 1
  proteinTargetG: number;
  goal: 'lose' | 'build' | 'maintain';
  accountAgeDays: number;
  trainingSessions7d: number;
}

export interface SignalComputeResult {
  state: StateLabel;
  patternQualifier: PatternQualifier | null;
  deltaPercent: number | null;
  baselineKcal: number | null;
  confidenceScore: number;
  candidateStates: StateLabel[];
  tier1: Tier1Result;
  tier2: Tier2Result;
}
