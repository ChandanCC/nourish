import mongoose, { Schema, Document } from 'mongoose';

// ── Item (single food row) ──────────────────────────────────────────────────
export interface IItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  mealLabel: string;
}

// ── Totals ──────────────────────────────────────────────────────────────────
export interface ITotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

// ── Micros ──────────────────────────────────────────────────────────────────
export interface IMicros {
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

// ── Entry (one log submission) ──────────────────────────────────────────────
export interface IEntry {
  entryId: string;
  rawText: string;
  summary: string;
  items: IItem[];
  totals: ITotals;
  micros: IMicros;
  loggedAt: Date;
}

// ── Day document ────────────────────────────────────────────────────────────
export interface INutritionDay extends Document {
  userId: string;
  dateKey: string;          // "2025-05-06"
  entries: IEntry[];
  dailyTotals: ITotals;
  dailyMicros: IMicros;
  updatedAt: Date;
  createdAt: Date;
}

// ── Schemas ─────────────────────────────────────────────────────────────────
const ItemSchema = new Schema<IItem>({
  name:       { type: String, required: true },
  quantity:   { type: String, default: '' },
  calories:   { type: Number, default: 0 },
  protein:    { type: Number, default: 0 },
  carbs:      { type: Number, default: 0 },
  fat:        { type: Number, default: 0 },
  fiber:      { type: Number, default: 0 },
  mealLabel:  { type: String, default: '' },
}, { _id: false });

const TotalsSchema = new Schema<ITotals>({
  calories: { type: Number, default: 0 },
  protein:  { type: Number, default: 0 },
  carbs:    { type: Number, default: 0 },
  fat:      { type: Number, default: 0 },
  fiber:    { type: Number, default: 0 },
}, { _id: false });

const MicrosSchema = new Schema<IMicros>({
  vitaminC:   { type: Number, default: 0 },
  vitaminD:   { type: Number, default: 0 },
  vitaminB12: { type: Number, default: 0 },
  vitaminA:   { type: Number, default: 0 },
  vitaminE:   { type: Number, default: 0 },
  vitaminK:   { type: Number, default: 0 },
  calcium:    { type: Number, default: 0 },
  iron:       { type: Number, default: 0 },
  magnesium:  { type: Number, default: 0 },
  zinc:       { type: Number, default: 0 },
  potassium:  { type: Number, default: 0 },
  sodium:     { type: Number, default: 0 },
  omega3:     { type: Number, default: 0 },
  folate:     { type: Number, default: 0 },
}, { _id: false });

const EntrySchema = new Schema<IEntry>({
  entryId:  { type: String, required: true },
  rawText:  { type: String, required: true },
  summary:  { type: String, default: '' },
  items:    { type: [ItemSchema], default: [] },
  totals:   { type: TotalsSchema, default: () => ({}) },
  micros:   { type: MicrosSchema, default: () => ({}) },
  loggedAt: { type: Date, default: Date.now },
}, { _id: false });

const NutritionDaySchema = new Schema<INutritionDay>({
  userId:      { type: String, required: true, index: true },
  dateKey:     { type: String, required: true },           // "YYYY-MM-DD"
  entries:     { type: [EntrySchema], default: [] },
  dailyTotals: { type: TotalsSchema, default: () => ({}) },
  dailyMicros: { type: MicrosSchema, default: () => ({}) },
}, { timestamps: true });

// Compound unique index — one doc per user per day
NutritionDaySchema.index({ userId: 1, dateKey: 1 }, { unique: true });

export const NutritionDay = mongoose.model<INutritionDay>('NutritionDay', NutritionDaySchema);
