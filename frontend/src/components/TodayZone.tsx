import { useState } from 'react';
import MacroRow from './MacroRow';
import { useCountUp } from '../hooks/useCountUp';

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface TodayZoneProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  targets: MacroTargets;
  aiInstruction: string | null;
}

export default function TodayZone({ calories, protein, carbs, fat, fiber, targets, aiInstruction }: TodayZoneProps) {
  const [macroExpanded, setMacroExpanded] = useState(false);
  const animatedCal = useCountUp(calories);

  const day = new Date().toLocaleDateString('en-IN', { weekday: 'long' });

  return (
    <div className="today-zone">
      {/* 2A — Daily Position */}
      <div className="today-daily-position px-5 py-4">

        {/* Header row: TODAY label + calories (tappable) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
            TODAY · {day}
          </div>
          <button
            onClick={() => setMacroExpanded(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'baseline',
              gap: 3,
            }}
            aria-label={macroExpanded ? 'Collapse macro panel' : 'Expand macro panel'}
          >
            <span style={{ fontSize: 16, fontFamily: 'var(--font-mono)', fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: 'var(--ink-0)' }}>
              {animatedCal}
            </span>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)' }}>kcal</span>
          </button>
        </div>

        {/* Protein — always visible */}
        <MacroRow label="Protein" current={protein} target={targets.protein} unit="g" />

        {/* Expanded macro panel */}
        {macroExpanded && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <MacroRow label="Carbs"   current={carbs} target={targets.carbs} unit="g" />
            <MacroRow label="Fat"     current={fat}   target={targets.fat}   unit="g" />
            <MacroRow label="Fiber"   current={fiber} target={targets.fiber} unit="g" />
            <MacroRow label="Calories" current={calories} target={targets.calories} unit="kcal" />
          </div>
        )}

        {/* AI instruction line */}
        {aiInstruction && (
          <div style={{ marginTop: 10, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', lineHeight: 1.5 }}>
            → {aiInstruction}
          </div>
        )}
      </div>

      {/* 2B — Training placeholder */}
      <div className="today-training px-5 py-4">
        <div className="text-[9px] tracking-widest opacity-40">TRAINING · Not logged</div>
      </div>

      {/* 2C — Micros: absent until micros are tracked */}
      <div className="today-micros" />
    </div>
  );
}
