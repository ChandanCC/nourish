import { useState } from 'react';
import type { AuthUser } from '../lib/auth';
import type { UserGoal } from '../types';
import { updateUserSettings } from '../api/client';

const PROTEIN_MULT: Record<UserGoal, number> = {
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

const GOAL_LABEL: Record<UserGoal, string> = {
  muscle_gain: 'BUILD',
  fat_loss:    'CUT',
  maintenance: 'MAINTAIN',
  performance: 'PERFORM',
};

const GOALS: UserGoal[] = ['muscle_gain', 'fat_loss', 'maintenance', 'performance'];

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

interface Props {
  user: AuthUser | null;
  currentGoal: UserGoal | null;
  currentWeightKg: number;
  onClose: () => void;
  onLogout: () => void;
  onSaved: () => void;
}

export default function SettingsScreen({ user, currentGoal, currentWeightKg, onClose, onLogout, onSaved }: Props) {
  const [goal,   setGoal]   = useState<UserGoal>(currentGoal ?? 'maintenance');
  const [weight, setWeight] = useState<number>(currentWeightKg);
  const [saving, setSaving] = useState(false);

  const isDirty         = goal !== currentGoal || weight !== currentWeightKg;
  const computedProtein = Math.round(PROTEIN_MULT[goal] * weight);
  const computedCalories = Math.round(KCAL_PER_KG[goal] * weight);

  function handleWeightBlur(e: React.FocusEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    if (isNaN(v) || v < 30) setWeight(30);
    else if (v > 300)       setWeight(300);
    else                    setWeight(Math.round(v));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateUserSettings(goal, weight);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const sectionLabel: React.CSSProperties = {
    ...mono,
    fontSize: 9,
    letterSpacing: '0.15em',
    color: 'var(--ink-3)',
    marginBottom: 16,
    display: 'block',
  };

  const rowLabel: React.CSSProperties = {
    ...mono,
    fontSize: 9,
    letterSpacing: '0.12em',
    color: 'var(--ink-3)',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'var(--bg-0)', display: 'flex', flexDirection: 'column', maxWidth: '32rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid var(--ink-4)' }}>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px 0', minHeight: 44, ...mono, fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.06em' }}
        >
          ← BACK
        </button>
        <span style={{ ...mono, fontSize: 10, letterSpacing: '0.15em', color: 'var(--ink-2)' }}>SETTINGS</span>
        <div style={{ width: 48 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '28px 20px 48px' }}>

        {/* ACCOUNT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          {user?.picture ? (
            <img src={user.picture} alt={user?.name ?? ''} style={{ width: 36, height: 36, borderRadius: '50%', opacity: 0.7, flexShrink: 0 }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--ink-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...mono, fontSize: 11, fontWeight: 700, color: 'var(--ink-2)' }}>
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <div style={{ ...mono, fontSize: 13, color: 'var(--ink-0)', marginBottom: 2 }}>{user?.name ?? '—'}</div>
            <div style={{ ...mono, fontSize: 10, color: 'var(--ink-3)' }}>{user?.email ?? '—'}</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--ink-4)', marginBottom: 28 }} />

        {/* PREFERENCES */}
        <span style={sectionLabel}>PREFERENCES</span>

        {/* Goal */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ ...rowLabel, marginBottom: 8 }}>GOAL</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {GOALS.map(g => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                style={{
                  flex: 1,
                  height: 32,
                  ...mono,
                  fontSize: 9,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  background: goal === g ? 'var(--ink-4)' : 'transparent',
                  border: `1px solid ${goal === g ? 'var(--ink-3)' : 'var(--ink-4)'}`,
                  color: goal === g ? 'var(--ink-0)' : 'var(--ink-2)',
                  transition: 'background 150ms linear, border-color 150ms linear, color 150ms linear',
                }}
              >
                {GOAL_LABEL[g]}
              </button>
            ))}
          </div>
        </div>

        {/* Lean body weight */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={rowLabel}>LEAN BODY WEIGHT</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                onBlur={handleWeightBlur}
                min={30}
                max={300}
                style={{
                  ...mono,
                  fontSize: 13,
                  color: 'var(--ink-0)',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  textAlign: 'right',
                  width: 52,
                }}
              />
              <span style={{ ...mono, fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>KG</span>
            </div>
          </div>
          <p style={{ ...mono, fontSize: 9, color: 'var(--ink-3)', lineHeight: 1.6, marginTop: 8 }}>
            Lean body weight = total weight × (1 − body fat %). Protein and calorie targets are based on lean mass, not total weight. Unsure of your body fat? Use ~85% of total weight for athletic build, ~80% for average, ~72% for higher body fat.
          </p>
        </div>

        {/* Computed targets (read-only) */}
        <div style={{ borderTop: '1px solid var(--ink-4)', marginTop: 20, marginBottom: 28, paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={rowLabel}>PROTEIN TARGET</span>
            <span style={{ ...mono, fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.06em' }}>~{computedProtein} G / DAY</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={rowLabel}>CALORIE TARGET</span>
            <span style={{ ...mono, fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.06em' }}>~{computedCalories} KCAL / DAY</span>
          </div>
        </div>

        {/* Save button — only when dirty */}
        {isDirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              height: 48,
              background: 'var(--gold)',
              color: 'var(--bg-0)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: '0.12em',
              border: 'none',
              cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.6 : 1,
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {saving ? (
              <>
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(8,8,13,0.2)', borderTopColor: 'var(--bg-0)', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                SAVING...
              </>
            ) : 'SAVE CHANGES'}
          </button>
        )}

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--ink-4)', paddingTop: 4 }}>
          <button
            onClick={onLogout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '16px 0', ...mono, fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-2)' }}
          >
            LOGOUT
          </button>
        </div>

      </div>
    </div>
  );
}
