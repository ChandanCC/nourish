import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { UserGoal } from '../../types';
import { saveOnboarding } from '../../api/client';

const PROTEIN_MULTIPLIER: Record<UserGoal, number> = {
  muscle_gain: 2.0,
  fat_loss:    2.2,
  performance: 2.0,
  maintenance: 1.6,
};

const KCAL_PER_KG: Record<UserGoal, number> = {
  muscle_gain: 38,
  fat_loss:    28,
  performance: 40,
  maintenance: 33,
};

interface Props {
  goal: UserGoal;
  onComplete: () => void;
}

export default function WeightScreen({ goal, onComplete }: Props) {
  const [weight, setWeight]   = useState('');
  const [saving, setSaving]   = useState(false);
  const queryClient           = useQueryClient();

  const weightKg  = parseFloat(weight) || 0;
  const protein   = weightKg > 0 ? Math.round(PROTEIN_MULTIPLIER[goal] * weightKg) : null;
  const calories  = weightKg > 0 ? Math.round(KCAL_PER_KG[goal] * weightKg) : null;
  const valid     = weightKg >= 20 && weightKg <= 300;

  async function handleSubmit() {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await saveOnboarding(goal, weightKg);
      await queryClient.invalidateQueries({ queryKey: ['home'] });
      onComplete();
    } finally {
      setSaving(false);
    }
  }

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
          Body weight
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 32 }}>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="75"
            min={20}
            max={300}
            autoFocus
            style={{
              width: 100,
              background: 'var(--bg-1)',
              border: '1px solid var(--ink-4)',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 24,
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              color: 'var(--ink-0)',
              textAlign: 'right',
              outline: 'none',
            }}
          />
          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ink-2)' }}>
            kg
          </span>
        </div>

        {protein !== null && (
          <div
            style={{
              marginBottom: 32,
              padding: '16px',
              background: 'var(--bg-1)',
              borderRadius: 8,
              border: '1px solid var(--ink-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {[
              { label: 'Protein target', value: `${protein}g / day` },
              { label: 'Calorie target', value: `${calories} kcal / day` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                  {label}
                </span>
                <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ink-1)', fontVariantNumeric: 'tabular-nums' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!valid || saving}
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
            cursor: valid && !saving ? 'pointer' : 'not-allowed',
            opacity: valid && !saving ? 1 : 0.35,
            transition: 'opacity 150ms linear',
          }}
        >
          {saving ? '…' : 'Start logging →'}
        </button>
      </div>
    </div>
  );
}
