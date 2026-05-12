import { useState } from 'react';
import type { TrainingPayload } from '../types';

interface TrainingCardProps {
  training: TrainingPayload | null;
  onOpen: () => void;
}

const ACTIVITY_LABELS: Record<string, string> = {
  gym: 'GYM', run: 'RUN', cycle: 'CYCLE', swim: 'SWIM', sport: 'SPORT', other: 'OTHER',
};

export default function TrainingCard({ training, onOpen }: TrainingCardProps) {
  const [hovered, setHovered] = useState(false);
  const logged = training?.logged ?? false;

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
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>
          TRAINING
        </span>
        {logged && training ? (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-1)', letterSpacing: '0.06em' }}>
            {training.totalCaloriesBurnt} <span style={{ color: 'var(--ink-2)' }}>kcal burnt</span>
          </span>
        ) : (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
            Not logged
          </span>
        )}
      </div>

      {logged && training && training.sessions.length > 0 && (
        <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {training.sessions.map(s => (
            <span key={s._id} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--ink-2)', letterSpacing: '0.04em' }}>
              {ACTIVITY_LABELS[s.activityType] ?? s.activityType} · {s.durationMin}min
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
