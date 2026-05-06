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
