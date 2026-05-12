import { useState } from 'react';
import type { ActivityType, TrainingExercise } from '../types';
import type { LogTrainingPayload } from '../api/client';

const MET: Record<ActivityType, number> = {
  gym:   4.0,
  run:   8.0,
  cycle: 6.0,
  swim:  7.0,
  sport: 6.0,
  other: 3.5,
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  gym:   'GYM',
  run:   'RUN',
  cycle: 'CYCLE',
  swim:  'SWIM',
  sport: 'SPORT',
  other: 'OTHER',
};

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  gym:   '🏋️',
  run:   '🏃',
  cycle: '🚴',
  swim:  '🏊',
  sport: '⚽',
  other: '⚡',
};

const BODY_PARTS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body'];

const EXERCISES: Record<string, string[]> = {
  Chest:       ['Bench Press', 'Incline Press', 'Cable Fly', 'Dips', 'Push-ups'],
  Back:        ['Deadlift', 'Pull-ups', 'Barbell Row', 'Lat Pulldown', 'Seated Row'],
  Shoulders:   ['Overhead Press', 'Lateral Raise', 'Face Pull', 'Arnold Press'],
  Arms:        ['Bicep Curl', 'Tricep Pushdown', 'Hammer Curl', 'Skull Crushers'],
  Legs:        ['Squat', 'Romanian Deadlift', 'Leg Press', 'Lunges', 'Leg Curl'],
  Core:        ['Plank', 'Cable Crunch', 'Hanging Leg Raise', 'Ab Wheel'],
  'Full Body': ['Clean and Press', 'Thrusters', 'Burpees', 'Kettlebell Swing'],
};

type FlowStep =
  | { kind: 'pick_activity' }
  | { kind: 'gym_body_parts' }
  | { kind: 'gym_exercises'; bodyParts: string[] }
  | { kind: 'gym_sets'; bodyParts: string[]; selectedExercises: string[] }
  | { kind: 'cardio_inputs'; activityType: 'run' | 'cycle' | 'swim' }
  | { kind: 'other_inputs'; activityType: 'sport' | 'other' }
  | { kind: 'duration'; activityType: ActivityType; exercises?: TrainingExercise[]; bodyParts?: string[]; distanceKm?: number; description?: string }
  | { kind: 'review'; payload: LogTrainingPayload & { caloriesPreview: number } };

interface Props {
  userWeightKg: number;
  onClose: () => void;
  onSubmit: (payload: LogTrainingPayload) => Promise<void>;
}

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

function computeCalories(activityType: ActivityType, durationMin: number, weightKg: number): number {
  return Math.round(MET[activityType] * weightKg * (durationMin / 60));
}

export default function TrainingLogScreen({ userWeightKg, onClose, onSubmit }: Props) {
  const [step, setStep] = useState<FlowStep>({ kind: 'pick_activity' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step: pick_activity
  function handlePickActivity(activity: ActivityType) {
    if (activity === 'gym') {
      setStep({ kind: 'gym_body_parts' });
    } else if (activity === 'run' || activity === 'cycle' || activity === 'swim') {
      setStep({ kind: 'cardio_inputs', activityType: activity });
    } else {
      setStep({ kind: 'other_inputs', activityType: activity as 'sport' | 'other' });
    }
  }

  async function handleSubmitReview(payload: LogTrainingPayload) {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(payload);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to log session');
    } finally {
      setSubmitting(false);
    }
  }

  const totalSteps = step.kind === 'pick_activity' ? 1
    : step.kind === 'gym_body_parts' ? 2
    : step.kind === 'gym_exercises' ? 3
    : step.kind === 'gym_sets' ? 4
    : step.kind.startsWith('cardio') || step.kind.startsWith('other') ? 2
    : step.kind === 'duration' ? (step.activityType === 'gym' ? 5 : 3)
    : step.kind === 'review' ? (step.payload.activityType === 'gym' ? 6 : 4)
    : 1;

  const currentStep = step.kind === 'pick_activity' ? 1
    : step.kind === 'gym_body_parts' ? 2
    : step.kind === 'gym_exercises' ? 3
    : step.kind === 'gym_sets' ? 4
    : step.kind.startsWith('cardio') || step.kind.startsWith('other') ? 2
    : step.kind === 'duration' ? (step.activityType === 'gym' ? 5 : 3)
    : totalSteps;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid var(--ink-4)' }}>
        <button
          onClick={step.kind === 'pick_activity' ? onClose : () => setStep({ kind: 'pick_activity' })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, ...mono, fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.06em' }}
        >
          ← BACK
        </button>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              style={{
                width: 4, height: 4, borderRadius: '50%',
                background: i < currentStep ? 'var(--ink-1)' : 'var(--ink-4)',
              }}
            />
          ))}
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, ...mono, fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 20px 40px' }}>
        {step.kind === 'pick_activity' && (
          <PickActivityStep onSelect={handlePickActivity} />
        )}

        {step.kind === 'gym_body_parts' && (
          <GymBodyPartsStep
            onNext={parts => setStep({ kind: 'gym_exercises', bodyParts: parts })}
          />
        )}

        {step.kind === 'gym_exercises' && (
          <GymExercisesStep
            bodyParts={step.bodyParts}
            onNext={exercises => setStep({ kind: 'gym_sets', bodyParts: step.bodyParts, selectedExercises: exercises })}
          />
        )}

        {step.kind === 'gym_sets' && (
          <GymSetsStep
            selectedExercises={step.selectedExercises}
            onNext={exercises => setStep({
              kind: 'duration',
              activityType: 'gym',
              exercises,
              bodyParts: step.bodyParts,
            })}
          />
        )}

        {step.kind === 'cardio_inputs' && (
          <CardioInputsStep
            activityType={step.activityType}
            onNext={(distanceKm) => setStep({ kind: 'duration', activityType: step.activityType, distanceKm })}
          />
        )}

        {step.kind === 'other_inputs' && (
          <OtherInputsStep
            activityType={step.activityType}
            onNext={(description) => setStep({ kind: 'duration', activityType: step.activityType, description })}
          />
        )}

        {step.kind === 'duration' && (
          <DurationStep
            activityType={step.activityType}
            userWeightKg={userWeightKg}
            onNext={durationMin => {
              const caloriesPreview = computeCalories(step.activityType, durationMin, userWeightKg);
              const payload: LogTrainingPayload & { caloriesPreview: number } = {
                activityType: step.activityType,
                durationMin,
                userWeightKg,
                bodyParts: step.bodyParts,
                exercises: step.exercises,
                distanceKm: step.distanceKm,
                description: step.description,
                caloriesPreview,
              };
              setStep({ kind: 'review', payload });
            }}
          />
        )}

        {step.kind === 'review' && (
          <ReviewStep
            payload={step.payload}
            submitting={submitting}
            error={error}
            onSubmit={() => {
              const { caloriesPreview: _, ...logPayload } = step.payload;
              handleSubmitReview(logPayload);
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Step components ─────────────────────────────────────────────────────────

function PickActivityStep({ onSelect }: { onSelect: (a: ActivityType) => void }) {
  const activities: ActivityType[] = ['gym', 'run', 'cycle', 'swim', 'sport', 'other'];
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: 24 }}>
        WHAT DID YOU DO?
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {activities.map(a => (
          <button
            key={a}
            onClick={() => onSelect(a)}
            style={{
              background: 'none',
              border: '1px solid var(--ink-4)',
              borderRadius: 4,
              padding: '20px 16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--ink-2)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--ink-4)')}
          >
            <span style={{ fontSize: 28 }}>{ACTIVITY_ICONS[a]}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-1)', textTransform: 'uppercase' }}>
              {ACTIVITY_LABELS[a]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function GymBodyPartsStep({ onNext }: { onNext: (parts: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(part: string) {
    setSelected(prev => prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]);
  }

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: 24 }}>
        WHAT DID YOU TRAIN?
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
        {BODY_PARTS.map(part => {
          const isSelected = selected.includes(part);
          return (
            <button
              key={part}
              onClick={() => toggle(part)}
              style={{
                background: isSelected ? 'var(--ink-1)' : 'none',
                border: `1px solid ${isSelected ? 'var(--ink-1)' : 'var(--ink-4)'}`,
                borderRadius: 2,
                padding: '6px 12px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.08em',
                color: isSelected ? 'var(--bg-0)' : 'var(--ink-2)',
                textTransform: 'uppercase',
              }}
            >
              {part}
            </button>
          );
        })}
      </div>
      <PrimaryButton disabled={selected.length === 0} onClick={() => onNext(selected)}>
        CONTINUE →
      </PrimaryButton>
    </div>
  );
}

function GymExercisesStep({ bodyParts, onNext }: { bodyParts: string[]; onNext: (exercises: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  function toggleExercise(name: string) {
    setSelected(prev => prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]);
  }

  function addCustom(part: string) {
    const val = (customInputs[part] ?? '').trim();
    if (!val) return;
    setSelected(prev => prev.includes(val) ? prev : [...prev, val]);
    setCustomInputs(prev => ({ ...prev, [part]: '' }));
  }

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: 24 }}>
        EXERCISES
      </div>
      {bodyParts.map(part => (
        <div key={part} style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 10 }}>
            {part}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {(EXERCISES[part] ?? []).map(ex => {
              const isSelected = selected.includes(ex);
              return (
                <button
                  key={ex}
                  onClick={() => toggleExercise(ex)}
                  style={{
                    background: isSelected ? 'var(--ink-1)' : 'none',
                    border: `1px solid ${isSelected ? 'var(--ink-1)' : 'var(--ink-4)'}`,
                    borderRadius: 2,
                    padding: '5px 10px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    letterSpacing: '0.06em',
                    color: isSelected ? 'var(--bg-0)' : 'var(--ink-2)',
                  }}
                >
                  {ex}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Add custom..."
              value={customInputs[part] ?? ''}
              onChange={e => setCustomInputs(prev => ({ ...prev, [part]: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addCustom(part)}
              style={{ flex: 1, background: 'none', border: '1px solid var(--ink-4)', borderRadius: 2, padding: '5px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-1)', outline: 'none' }}
            />
            <button
              onClick={() => addCustom(part)}
              style={{ background: 'none', border: '1px solid var(--ink-4)', borderRadius: 2, padding: '5px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', cursor: 'pointer' }}
            >
              +
            </button>
          </div>
        </div>
      ))}
      <PrimaryButton disabled={selected.length === 0} onClick={() => onNext(selected)}>
        CONTINUE → ({selected.length} selected)
      </PrimaryButton>
    </div>
  );
}

interface SetEntry { reps: string; weightKg: string }

function GymSetsStep({ selectedExercises, onNext }: { selectedExercises: string[]; onNext: (exercises: TrainingExercise[]) => void }) {
  const [sets, setSets] = useState<Record<string, SetEntry[]>>(
    Object.fromEntries(selectedExercises.map(ex => [ex, [{ reps: '', weightKg: '' }]])),
  );

  function updateSet(ex: string, idx: number, field: keyof SetEntry, value: string) {
    setSets(prev => {
      const updated = [...prev[ex]];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, [ex]: updated };
    });
  }

  function addSet(ex: string) {
    setSets(prev => ({ ...prev, [ex]: [...prev[ex], { reps: '', weightKg: '' }] }));
  }

  function removeSet(ex: string, idx: number) {
    setSets(prev => ({ ...prev, [ex]: prev[ex].filter((_, i) => i !== idx) }));
  }

  function handleNext() {
    const exercises: TrainingExercise[] = selectedExercises.map(ex => ({
      name: ex,
      sets: sets[ex]
        .filter(s => s.reps !== '' || s.weightKg !== '')
        .map(s => ({
          reps: parseInt(s.reps || '0', 10),
          weightKg: parseFloat(s.weightKg || '0'),
        })),
    }));
    onNext(exercises);
  }

  const inputStyle: React.CSSProperties = {
    width: 60,
    background: 'none',
    border: '1px solid var(--ink-4)',
    borderRadius: 2,
    padding: '4px 6px',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--ink-1)',
    outline: 'none',
    textAlign: 'center',
  };

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: 24 }}>
        SETS & REPS
      </div>
      {selectedExercises.map(ex => (
        <div key={ex} style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span>{ex}</span>
            <div style={{ display: 'flex', gap: 20, color: 'var(--ink-4)', fontSize: 8 }}>
              <span>REPS</span>
              <span>KG</span>
            </div>
          </div>
          {sets[ex].map((s, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-4)', width: 20 }}>
                {idx + 1}
              </span>
              <input
                type="number"
                placeholder="10"
                value={s.reps}
                onChange={e => updateSet(ex, idx, 'reps', e.target.value)}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="60"
                value={s.weightKg}
                onChange={e => updateSet(ex, idx, 'weightKg', e.target.value)}
                style={inputStyle}
              />
              {sets[ex].length > 1 && (
                <button
                  onClick={() => removeSet(ex, idx)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)', padding: 0 }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addSet(ex)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.06em', padding: '4px 0', marginLeft: 28 }}
          >
            + ADD SET
          </button>
        </div>
      ))}
      <div style={{ marginTop: 8 }}>
        <PrimaryButton onClick={handleNext}>CONTINUE →</PrimaryButton>
        <button
          onClick={() => onNext(selectedExercises.map(ex => ({ name: ex, sets: [] })))}
          style={{ display: 'block', margin: '10px auto 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.06em' }}
        >
          SKIP SETS
        </button>
      </div>
    </div>
  );
}

function CardioInputsStep({ activityType, onNext }: { activityType: 'run' | 'cycle' | 'swim'; onNext: (distanceKm?: number) => void }) {
  const [distance, setDistance] = useState('');
  const label = activityType === 'run' ? 'DISTANCE (KM)' : activityType === 'cycle' ? 'DISTANCE (KM)' : 'DISTANCE (KM, OPTIONAL)';

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: 24 }}>
        {label}
      </div>
      <input
        type="number"
        inputMode="decimal"
        placeholder="0.0"
        value={distance}
        onChange={e => setDistance(e.target.value)}
        autoFocus
        style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--ink-3)', padding: '8px 0', fontFamily: 'var(--font-mono)', fontSize: 32, color: 'var(--ink-0)', outline: 'none', marginBottom: 32 }}
      />
      <PrimaryButton onClick={() => onNext(distance ? parseFloat(distance) : undefined)}>
        CONTINUE →
      </PrimaryButton>
      {activityType === 'swim' && (
        <button
          onClick={() => onNext(undefined)}
          style={{ display: 'block', margin: '10px auto 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.06em' }}
        >
          SKIP
        </button>
      )}
    </div>
  );
}

function OtherInputsStep({ activityType, onNext }: { activityType: 'sport' | 'other'; onNext: (description?: string) => void }) {
  const [desc, setDesc] = useState('');
  const label = activityType === 'sport' ? 'WHAT SPORT?' : 'DESCRIBE ACTIVITY (OPTIONAL)';

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: 24 }}>
        {label}
      </div>
      <input
        type="text"
        placeholder={activityType === 'sport' ? 'Football, Tennis...' : 'Yoga, Hiking...'}
        value={desc}
        onChange={e => setDesc(e.target.value)}
        autoFocus
        style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--ink-3)', padding: '8px 0', fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--ink-0)', outline: 'none', marginBottom: 32 }}
      />
      <PrimaryButton onClick={() => onNext(desc.trim() || undefined)}>CONTINUE →</PrimaryButton>
      <button
        onClick={() => onNext(undefined)}
        style={{ display: 'block', margin: '10px auto 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.06em' }}
      >
        SKIP
      </button>
    </div>
  );
}

function DurationStep({ activityType, userWeightKg, onNext }: { activityType: ActivityType; userWeightKg: number; onNext: (min: number) => void }) {
  const [duration, setDuration] = useState('');
  const preview = duration ? computeCalories(activityType, parseInt(duration, 10), userWeightKg) : null;

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: 24 }}>
        DURATION (MINUTES)
      </div>
      <input
        type="number"
        inputMode="numeric"
        placeholder="60"
        value={duration}
        onChange={e => setDuration(e.target.value)}
        autoFocus
        style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--ink-3)', padding: '8px 0', fontFamily: 'var(--font-mono)', fontSize: 48, color: 'var(--ink-0)', outline: 'none', marginBottom: 16 }}
      />
      {preview !== null && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', marginBottom: 32 }}>
          ≈ {preview} kcal burnt
        </div>
      )}
      <PrimaryButton
        disabled={!duration || parseInt(duration, 10) < 1}
        onClick={() => onNext(parseInt(duration, 10))}
      >
        CONTINUE →
      </PrimaryButton>
    </div>
  );
}

function ReviewStep({
  payload, submitting, error, onSubmit,
}: {
  payload: LogTrainingPayload & { caloriesPreview: number };
  submitting: boolean;
  error: string | null;
  onSubmit: () => void;
}) {
  const totalVolume = payload.exercises?.reduce((s, ex) =>
    s + ex.sets.reduce((ss, set) => ss + set.reps * set.weightKg, 0), 0) ?? 0;

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: 24 }}>
        REVIEW
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        <ReviewRow label="ACTIVITY" value={ACTIVITY_LABELS[payload.activityType]} />
        <ReviewRow label="DURATION" value={`${payload.durationMin} MIN`} />
        <ReviewRow label="CALORIES BURNT" value={`~${payload.caloriesPreview} KCAL`} />
        {payload.bodyParts && payload.bodyParts.length > 0 && (
          <ReviewRow label="MUSCLES" value={payload.bodyParts.join(', ').toUpperCase()} />
        )}
        {payload.exercises && payload.exercises.length > 0 && (
          <ReviewRow label="EXERCISES" value={`${payload.exercises.length} exercises`} />
        )}
        {totalVolume > 0 && (
          <ReviewRow label="VOLUME" value={`${Math.round(totalVolume).toLocaleString()} KG`} />
        )}
        {payload.distanceKm != null && (
          <ReviewRow label="DISTANCE" value={`${payload.distanceKm} KM`} />
        )}
        {payload.description && (
          <ReviewRow label="NOTE" value={payload.description} />
        )}
      </div>

      {error && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--status-red)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <PrimaryButton onClick={onSubmit} disabled={submitting}>
        {submitting ? 'LOGGING...' : 'LOG SESSION'}
      </PrimaryButton>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-1)' }}>{value}</span>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '14px 20px',
        background: disabled ? 'var(--ink-4)' : 'var(--ink-1)',
        border: 'none',
        borderRadius: 2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.1em',
        color: disabled ? 'var(--ink-3)' : 'var(--bg-0)',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </button>
  );
}
