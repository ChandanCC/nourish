import { useState, type RefObject } from 'react';
import TodayZone from './TodayZone';
import LogZone from './LogZone';
import ErrorBoundary from './ErrorBoundary';
import type { FoodEntry } from '../types';
import type { EditEntryPayload } from '../api/client';

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface DayMicros {
  iron: number;
  calcium: number;
  vitaminD: number;
  vitaminB12: number;
  magnesium: number;
  zinc: number;
  potassium: number;
  sodium: number;
  isEstimated: boolean;
}

interface NutritionDetailScreenProps {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  targets: MacroTargets;
  micros: DayMicros;
  aiInstruction: string | null;
  entries: FoodEntry[];
  deletingId: string | null;
  editingId: string | null;
  onDelete: (id: string) => void;
  onEdit: (id: string, payload: EditEntryPayload) => void;
  // Food logging
  input: string;
  setInput: (v: string) => void;
  analysing: boolean;
  onLog: () => void;
  error: string | null;
  onClearError: () => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
  onDayIntel?: () => void;
  onMealIntel?: (entryId: string, mealName: string) => void;
}

export default function NutritionDetailScreen({
  date, calories, protein, carbs, fat, fiber, targets, micros, aiInstruction,
  entries, deletingId, editingId, onDelete, onEdit,
  input, setInput, analysing, onLog, error, onClearError, textareaRef,
  onClose, onDayIntel, onMealIntel,
}: NutritionDetailScreenProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'var(--bg-0)', display: 'flex', flexDirection: 'column', maxWidth: '32rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid var(--ink-4)' }}>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.06em' }}
        >
          ← BACK
        </button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>
          NUTRITION
        </span>
        {onDayIntel ? (
          <button
            onClick={onDayIntel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px 0', minHeight: 44, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', transition: 'color 150ms linear' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}
          >
            INTEL →
          </button>
        ) : (
          <div style={{ width: 60 }} />
        )}
      </div>

      {/* Scrim */}
      <div
        style={{
          position: 'absolute',
          top: 44, left: 0, right: 0, bottom: 0,
          background: 'rgba(8,8,13,0.60)',
          pointerEvents: 'none',
          zIndex: 9,
          opacity: isFocused ? 1 : 0,
          transition: 'opacity 150ms linear',
        }}
      />

      {/* Scrollable content */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <ErrorBoundary>
          <TodayZone
            date={date}
            calories={calories}
            protein={protein}
            carbs={carbs}
            fat={fat}
            fiber={fiber}
            targets={targets}
            micros={micros}
            aiInstruction={aiInstruction}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <LogZone
            entries={entries}
            isLoading={false}
            activeDay={date}
            deletingId={deletingId}
            editingId={editingId}
            onDelete={onDelete}
            onEdit={onEdit}
            onIntel={onMealIntel}
          />
        </ErrorBoundary>
      </div>

      {/* Command bar — food only */}
      <div
        style={{
          flexShrink: 0,
          position: 'relative',
          background: 'var(--bg-0)',
          borderTop: isFocused ? '1px solid rgba(237,184,74,0.25)' : '1px solid var(--ink-4)',
          transition: 'border-top-color 150ms linear',
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: 'absolute', top: -48, left: 0, right: 0, height: 48,
            background: 'linear-gradient(to bottom, transparent, var(--bg-0))',
            pointerEvents: 'none',
          }}
        />

        {error && (
          <div
            className="mx-5 mt-2 px-3 py-2 rounded-lg text-[10px] leading-relaxed break-words"
            style={{ background: 'rgba(232,84,84,0.07)', border: '1px solid rgba(232,84,84,0.20)', color: 'var(--status-down)' }}
          >
            <strong>Error:</strong> {error}
            <span className="ml-2 cursor-pointer opacity-50" onClick={onClearError}>✕</span>
          </div>
        )}

        <div className="px-5 pb-6 pt-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onLog(); }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={'What did you eat?\n\n"2 eggs, banana, oats for breakfast"'}
            rows={3}
            className="w-full rounded-xl px-3.5 py-3 text-[12px] leading-relaxed outline-none transition-colors duration-200"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--ink-4)', color: 'var(--ink-0)', resize: 'none' }}
          />
          <div className="flex justify-between items-center mt-2.5">
            <span className="text-[9px] opacity-20 tracking-wide">⌘↩ to log</span>
            <button
              onClick={onLog}
              disabled={analysing || !input.trim()}
              className="font-display font-extrabold text-[13px] tracking-widest rounded-xl px-6 py-3 transition-all duration-200 hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--gold)', color: 'var(--bg-0)' }}
            >
              {analysing ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-black/20 border-t-bg-0 animate-spin" />
                  Analysing...
                </span>
              ) : 'LOG IT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
