export interface Item {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  mealLabel: string;
}

export interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface Micros {
  vitaminC: number;
  vitaminD: number;
  vitaminB12: number;
  vitaminA: number;
  vitaminE: number;
  vitaminK: number;
  calcium: number;
  iron: number;
  magnesium: number;
  zinc: number;
  potassium: number;
  sodium: number;
  omega3: number;
  folate: number;
}

export interface Entry {
  entryId: string;
  rawText: string;
  summary: string;
  items: Item[];
  totals: Totals;
  micros: Micros;
  loggedAt: string;
}

export interface NutritionDay {
  _id: string;
  userId: string;
  dateKey: string;
  entries: Entry[];
  dailyTotals: Totals;
  dailyMicros: Micros;
  createdAt: string;
  updatedAt: string;
}

export type MacroKey = 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber';
export type StatusColor = 'green' | 'yellow' | 'red' | 'dim';

// New data model types (Phase 04+ architecture)
export interface FoodEntry {
  _id: string;
  mealDate: string;
  loggedAt: string;
  rawInput: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  parseNote: string | null;
  ironMg: number;
  calciumMg: number;
  vitaminDMcg: number;
  vitaminB12Mcg: number;
  magnesiumMg: number;
  zincMg: number;
  potassiumMg: number;
  sodiumMg: number;
}

export interface HomeWaveformDay {
  date: string;
  calories: number;
  entryCount: number;
}

export interface HomeScreenPayload {
  today: {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    entryCount: number;
    targets: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
    micros: {
      iron: number;
      calcium: number;
      vitaminD: number;
      vitaminB12: number;
      magnesium: number;
      zinc: number;
      potassium: number;
      sodium: number;
      isEstimated: boolean;
    };
  };
  signal: {
    state: string;
    subtitle: string | null;
    delta: string | null;
    patternQualifier: string | null;
    aiInstruction: string | null;
    isStale: boolean;
  };
  waveform: HomeWaveformDay[];
  entries: FoodEntry[];
  training: TrainingPayload;
  userWeightKg: number;
  userId: string;
  onboardingComplete: boolean;
}

export type UserGoal = 'muscle_gain' | 'fat_loss' | 'maintenance' | 'performance';

export type ActivityType = 'gym' | 'run' | 'cycle' | 'swim' | 'sport' | 'other';

export interface TrainingExerciseSet {
  reps: number;
  weightKg: number;
}

export interface TrainingExercise {
  name: string;
  sets: TrainingExerciseSet[];
}

export interface TrainingSession {
  _id: string;
  activityType: ActivityType;
  durationMin: number;
  caloriesBurnt: number;
  bodyParts: string[];
  exercises: TrainingExercise[];
  distanceKm?: number;
  description?: string;
}

export interface TrainingPayload {
  logged: boolean;
  totalCaloriesBurnt: number;
  totalVolumeKg: number;
  sessions: TrainingSession[];
}

// ── INTEL types ───────────────────────────────────────────────────────────────

export type DayRating = 'STRONG' | 'SOLID' | 'SHORT' | 'WEAK';

export interface MealIntel {
  _id: string;
  level: 'meal';
  refId: string;
  narrative: string;
  instruction: string | null;
  projection: null;
  dayRating: null;
  aiModel: string;
  generatedAt: string;
}

export interface SessionIntel {
  _id: string;
  level: 'session';
  refId: string;
  narrative: string;
  instruction: string | null;
  projection: null;
  dayRating: null;
  aiModel: string;
  generatedAt: string;
}

export interface DayIntel {
  _id: string;
  level: 'daily';
  refId: string;
  narrative: string;
  metrics: { whatWentWell: string; whatToImprove: string; [key: string]: unknown };
  instruction: string | null;
  projection: null;
  dayRating: DayRating;
  aiModel: string;
  generatedAt: string;
}

export interface WeekIntel {
  _id: string;
  level: 'weekly';
  refId: string;
  metrics: {
    signal_state: string;
    state_days_count: number;
    avg_delta_pct: number | null;
    avg_calories_7d: number | null;
    protein_adherence_pct: number;
    days_logged: number;
    training_sessions_count: number;
    [key: string]: unknown;
  };
  narrative: string;
  instruction: string | null;
  projection: string | null;
  dayRating: null;
  aiModel: string;
  generatedAt: string;
}

export interface MonthIntel {
  _id: string;
  level: 'monthly';
  refId: string;
  metrics: {
    avg_calories: number;
    baseline_kcal: number | null;
    avg_delta_pct: number | null;
    protein_adherence_pct: number;
    days_logged: number;
    total_days_in_month: number;
    training_sessions_count: number;
    dominant_state: string;
    [key: string]: unknown;
  };
  narrative: string;
  instruction: string | null;
  projection: string | null;
  dayRating: null;
  aiModel: string;
  generatedAt: string;
}
