import { useState } from 'react';
import { useCountUp } from '../hooks/useCountUp';

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface NutritionCardProps {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  targets: MacroTargets;
  onOpen: () => void;
}

export default function NutritionCard({ date, calories, protein, carbs, fat, fiber, targets, onOpen }: NutritionCardProps) {
  const [hovered, setHovered] = useState(false);
  const animatedCal = useCountUp(calories);

  const today = new Date().toISOString().split('T')[0];
  const isToday = date === today;
  const day = new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long' });

  const proteinPct = targets.protein > 0 ? Math.min(1, protein / targets.protein) : 0;

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        width: '100%',
        background: 'none',
        border: `1px solid ${hovered ? 'var(--ink-3)' : 'var(--ink-4)'}`,
        borderRadius: 4,
        padding: '14px 20px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.15s',
        margin: '0 0 0 0',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
          NUTRITION · {isToday ? 'TODAY' : day}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em' }}>
          <span style={{ color: 'var(--ink-1)' }}>{animatedCal}</span>
          <span style={{ color: 'var(--ink-2)' }}> kcal</span>
        </span>
      </div>

      {/* Protein bar */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>Protein</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontVariantNumeric: 'tabular-nums' }}>
            <span style={{ color: 'var(--ink-1)' }}>{protein}g</span>
            <span style={{ color: 'var(--ink-3)' }}> / {targets.protein}g</span>
          </span>
        </div>
        <div style={{ height: 2, background: 'var(--ink-4)', borderRadius: 1 }}>
          <div style={{ height: '100%', width: `${proteinPct * 100}%`, background: 'var(--ink-2)', borderRadius: 1, transition: 'width 0.4s var(--ease-data)' }} />
        </div>
      </div>

      {/* Carbs · Fat · Fiber inline */}
      <div style={{ display: 'flex', gap: 12 }}>
        {([
          { label: 'Carbs', value: carbs },
          { label: 'Fat',   value: fat   },
          { label: 'Fiber', value: fiber },
        ] as Array<{ label: string; value: number }>).map(m => (
          <span key={m.label} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.04em' }}>
            <span style={{ color: 'var(--ink-3)' }}>{m.label} </span>
            <span style={{ color: 'var(--ink-1)' }}>{m.value}g</span>
          </span>
        ))}
      </div>
    </button>
  );
}
