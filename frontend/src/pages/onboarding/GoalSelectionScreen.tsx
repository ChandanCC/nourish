import { useState } from 'react';
import type { UserGoal } from '../../types';

const GOALS: { value: UserGoal; label: string }[] = [
  { value: 'muscle_gain',  label: 'Build muscle' },
  { value: 'fat_loss',     label: 'Reduce body fat' },
  { value: 'maintenance',  label: 'Maintain weight' },
  { value: 'performance',  label: 'Athletic performance' },
];

interface Props {
  onContinue: (goal: UserGoal) => void;
}

export default function GoalSelectionScreen({ onContinue }: Props) {
  const [selected, setSelected] = useState<UserGoal | null>(null);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-0)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 24px',
      }}
    >
      <div style={{ maxWidth: 480, width: '100%', margin: '0 auto' }}>
        <div
          style={{
            fontSize: 9,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            marginBottom: 16,
          }}
        >
          Goal
        </div>
        <div style={{ marginBottom: 32 }}>
          {GOALS.map(({ value, label }) => {
            const isSelected = selected === value;
            return (
              <button
                key={value}
                onClick={() => setSelected(value)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 16px',
                  marginBottom: 8,
                  background: isSelected ? 'var(--bg-2)' : 'var(--bg-1)',
                  border: 'none',
                  borderLeft: isSelected ? '1px solid var(--gold-1)' : '1px solid transparent',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'var(--font-mono)',
                  color: isSelected ? 'var(--ink-0)' : 'var(--ink-2)',
                  transition: 'background 150ms linear, color 150ms linear',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => selected && onContinue(selected)}
          disabled={!selected}
          style={{
            background: 'var(--bg-2)',
            color: 'var(--ink-1)',
            border: '1px solid var(--ink-4)',
            borderRadius: 12,
            padding: '14px 28px',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            fontWeight: 400,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: selected ? 'pointer' : 'not-allowed',
            opacity: selected ? 1 : 0.35,
            transition: 'opacity 150ms linear',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
