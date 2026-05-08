import type { SignalComputeResult, StateLabel, PatternQualifier } from './types';

export interface Tier3Input {
  computeResult: SignalComputeResult;
  goal: 'lose' | 'build' | 'maintain';
  proteinTargetG: number;
  baselineKcal: number | null;
  baselineEstablished: boolean;
  accountAgeDays: number;
  trainingSessions7d: number;
}

export interface Tier3Output {
  state: StateLabel;
  pattern: PatternQualifier | null;
  aiInstruction: string | null;
  reasoning: string;
}

const PROHIBITED_PATTERNS = [
  /great job/i, /nice work/i, /keep it up/i, /you're crushing/i,
  /well done/i, /awesome/i, /fantastic/i, /listen to your body/i,
  /your body needs/i, /try to/i, /consider /i, /you might want/i,
  /based on your data/i, /!/,
];

function validateOutput(raw: unknown, candidateStates: StateLabel[]): Tier3Output | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  const validStates: StateLabel[] = [
    'READING', 'UNDERFUELLED', 'PROTEIN-LIMITED', 'DRIFTING', 'CUTTING', 'BUILDING', 'OPTIMISING',
  ];
  const state = obj['state'] as StateLabel;
  if (!validStates.includes(state)) return null;

  // AI cannot return READING or UNDERFUELLED — those are Tier 1 hard rules
  if (state === 'READING' || state === 'UNDERFUELLED') return null;

  // State must be from candidate list or DRIFTING
  if (state !== 'DRIFTING' && !candidateStates.includes(state)) return null;

  const pattern = (obj['pattern'] as PatternQualifier | null) ?? null;
  let aiInstruction = (obj['ai_instruction'] as string | null) ?? null;
  const reasoning = typeof obj['reasoning'] === 'string' ? obj['reasoning'] : '';

  if (aiInstruction !== null) {
    // Enforce max length
    if (aiInstruction.length > 120) aiInstruction = aiInstruction.slice(0, 120);
    // Check prohibited patterns
    if (PROHIBITED_PATTERNS.some(p => p.test(aiInstruction!))) aiInstruction = null;
  }

  return { state, pattern, aiInstruction, reasoning };
}

const SIGNAL_SYSTEM_PROMPT = `You are Nouriq's nutrition intelligence engine. You receive pre-computed statistics about a user's recent logging pattern. Your job is to:
1. Select the most accurate STATE from the candidate_states list
2. Confirm or adjust the pattern qualifier
3. Generate one instruction line (or null)

CRITICAL RULES:
STATE SELECTION: Choose from candidate_states only. If none fit, return "DRIFTING". Prefer conservative state when two are equally plausible. READING and UNDERFUELLED are never in candidate_states.
PATTERN QUALIFIER: "consistent" (cv < 0.15), "building" (slope > 5 kcal/day), "irregular" (high variance).
INSTRUCTION LINE: Return null if STATE is OPTIMISING and protein adherence > 0.82, if everything is on track, if hours_remaining_today < 4.
Return instruction only if protein_gap_today > 30g and hours_remaining_today >= 4, or STATE is PROTEIN-LIMITED, or goal-behavior conflict.
INSTRUCTION FORMAT: 1 sentence max. 120 chars max. Specific numbers required. No praise. No hedging. No "you should". No "your body". No exclamation points.
VALID EXAMPLES: "Protein is 48g below target — add a protein source to dinner." "Intake averaged 1,340 kcal against a 1,940 kcal baseline this week."

Return ONLY valid JSON matching: { "state": string, "pattern": string|null, "ai_instruction": string|null, "reasoning": string }
No markdown. No prose outside JSON.`;

export async function callTier3(
  input: Tier3Input,
  anthropicApiKey: string,
): Promise<Tier3Output | null> {
  const { computeResult, goal, proteinTargetG, baselineKcal, baselineEstablished, trainingSessions7d } = input;

  const hoursNow = new Date().getHours();
  const hoursRemainingToday = Math.max(0, 24 - hoursNow);

  const proteinGapToday = computeResult.tier1.avgProtein5d !== null
    ? Math.max(0, proteinTargetG - computeResult.tier1.avgProtein5d)
    : null;

  const userMessage = JSON.stringify({
    computation_type: 'state_and_instruction',
    user: {
      goal,
      protein_target_g: proteinTargetG,
      baseline_kcal: baselineKcal,
      baseline_established: baselineEstablished,
      current_state: computeResult.state,
    },
    computed: {
      avg_calories_7d: computeResult.tier1.avgCalories7d,
      avg_protein_5d: computeResult.tier1.avgProtein5d,
      protein_adherence_5d: computeResult.tier1.proteinAdherence5d,
      delta_percent: computeResult.deltaPercent,
      cv_7d: computeResult.tier2.cv7d,
      pattern_slope_kcal_per_day: computeResult.tier2.patternSlope,
      pattern_qualifier: computeResult.tier2.patternQualifier,
      confidence: computeResult.confidenceScore,
      candidate_states: computeResult.candidateStates,
      protein_gap_today: proteinGapToday,
      hours_remaining_today: hoursRemainingToday,
      training_sessions_7d: trainingSessions7d,
    },
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: SIGNAL_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!resp.ok) return null;

    const data = await resp.json() as any;
    const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
    if (!textBlock?.text) return null;

    const parsed = JSON.parse(textBlock.text);
    return validateOutput(parsed, computeResult.candidateStates);
  } catch {
    clearTimeout(timeout);
    return null;
  }
}
