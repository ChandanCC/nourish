import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { UserGoal } from '../../types';
import { saveOnboarding } from '../../api/client';

interface Props {
  goal: UserGoal;
  onComplete: () => void;
}

export default function ProteinTargetScreen({ goal, onComplete }: Props) {
  const [value, setValue] = useState(160);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  function handleChange(raw: string) {
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) setValue(parsed);
  }

  async function handleSubmit() {
    const clamped = Math.max(30, Math.min(500, value));
    setSaving(true);
    try {
      await saveOnboarding(goal, clamped);
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
          Daily protein target
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 40 }}>
          <input
            type="number"
            value={value}
            onChange={e => handleChange(e.target.value)}
            min={30}
            max={500}
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
          <span
            style={{
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink-2)',
            }}
          >
            g protein / day
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
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
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.5 : 1,
            transition: 'opacity 150ms linear',
          }}
        >
          {saving ? '…' : 'Finish setup'}
        </button>
      </div>
    </div>
  );
}
