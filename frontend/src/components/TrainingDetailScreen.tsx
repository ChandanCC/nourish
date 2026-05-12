import { useState } from 'react';
import type { TrainingSession } from '../types';

const ACTIVITY_LABELS: Record<string, string> = {
  gym: 'GYM', run: 'RUN', cycle: 'CYCLE', swim: 'SWIM', sport: 'SPORT', other: 'OTHER',
};

const ACTIVITY_ICONS: Record<string, string> = {
  gym: '🏋️', run: '🏃', cycle: '🚴', swim: '🏊', sport: '⚽', other: '⚡',
};

interface TrainingDetailScreenProps {
  sessions: TrainingSession[];
  totalCaloriesBurnt: number;
  totalVolumeKg: number;
  deletingId: string | null;
  onDelete: (id: string) => void;
  onOpenLog: () => void;
  onClose: () => void;
}

export default function TrainingDetailScreen({
  sessions, totalCaloriesBurnt, totalVolumeKg, deletingId, onDelete, onOpenLog, onClose,
}: TrainingDetailScreenProps) {
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
          TRAINING
        </span>
        <button
          onClick={onOpenLog}
          style={{ background: 'none', border: '1px solid var(--ink-3)', borderRadius: 2, padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', color: 'var(--ink-1)', textTransform: 'uppercase' }}
        >
          + LOG
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: '20px 20px 40px' }}>
        {sessions.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-4)', textTransform: 'uppercase' }}>
            No sessions logged
          </div>
        ) : (
          <>
            {/* Day totals */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--ink-4)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.08em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 2 }}>Burnt</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-1)', fontVariantNumeric: 'tabular-nums' }}>
                  {totalCaloriesBurnt} <span style={{ fontSize: 9, color: 'var(--ink-3)' }}>kcal</span>
                </div>
              </div>
              {totalVolumeKg > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.08em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 2 }}>Volume</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-1)', fontVariantNumeric: 'tabular-nums' }}>
                    {Math.round(totalVolumeKg).toLocaleString()} <span style={{ fontSize: 9, color: 'var(--ink-3)' }}>kg</span>
                  </div>
                </div>
              )}
            </div>

            {/* Session cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sessions.map(s => (
                <SessionCard
                  key={s._id}
                  session={s}
                  deleting={deletingId === s._id}
                  onDelete={() => onDelete(s._id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SessionCard({ session, deleting, onDelete }: { session: TrainingSession; deleting: boolean; onDelete: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const totalVolume = session.exercises.reduce((s, ex) =>
    s + ex.sets.reduce((ss, set) => ss + set.reps * set.weightKg, 0), 0);

  return (
    <div style={{ border: '1px solid var(--ink-4)', borderRadius: 4, padding: '14px 16px' }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{ACTIVITY_ICONS[session.activityType] ?? '⚡'}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--ink-1)', textTransform: 'uppercase' }}>
            {ACTIVITY_LABELS[session.activityType] ?? session.activityType}
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>
          {session.caloriesBurnt} <span style={{ color: 'var(--ink-4)', fontSize: 8 }}>kcal</span>
        </span>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 16, marginBottom: session.exercises.length > 0 || session.distanceKm != null ? 10 : 0 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)' }}>
          {session.durationMin} min
        </span>
        {session.bodyParts.length > 0 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-2)' }}>
            {session.bodyParts.join(' · ')}
          </span>
        )}
        {session.distanceKm != null && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)' }}>
            {session.distanceKm} km
          </span>
        )}
        {totalVolume > 0 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-4)' }}>
            {Math.round(totalVolume).toLocaleString()} kg vol
          </span>
        )}
      </div>

      {/* Exercises */}
      {session.exercises.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {session.exercises.map(ex => (
            <span key={ex.name} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--ink-2)', background: 'rgba(232,227,216,0.06)', borderRadius: 2, padding: '2px 6px' }}>
              {ex.name}{ex.sets.length > 0 ? ` ×${ex.sets.length}` : ''}
            </span>
          ))}
        </div>
      )}

      {session.description && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-2)', marginBottom: 10 }}>
          {session.description}
        </div>
      )}

      {/* Delete */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {confirmDelete ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)' }}>Delete session?</span>
            <button
              onClick={() => onDelete()}
              disabled={deleting}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--status-down)', letterSpacing: '0.06em', padding: 0 }}
            >
              {deleting ? '...' : 'YES'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.06em', padding: 0 }}
            >
              NO
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.06em', padding: 0, opacity: 0.6 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
          >
            DELETE
          </button>
        )}
      </div>
    </div>
  );
}
