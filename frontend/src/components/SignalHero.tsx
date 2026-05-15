import { useState } from 'react';
import Waveform from './Waveform';

interface WaveformBarDay {
  calories: number;
  isToday: boolean;
  label: string;
}

interface SignalHeroProps {
  state: string;
  subtitle?: string | null;
  delta?: string | null;
  waveformDays?: WaveformBarDay[];
  selectedDay?: number;
  baseline?: number;
  onDaySelect?: (index: number) => void;
  onWeekIntel?: () => void;
  onMonthIntel?: () => void;
}

const STATE_DESCRIPTIONS: Record<string, string> = {
  READING: 'Less than 3 days of data logged. Your baseline is still forming — the system needs more data points to compute a pattern.',
  OPTIMISING: 'Intake and protein are on target relative to your goal. Your inputs are generating the output your goal requires.',
  BUILDING: 'Consistent caloric surplus with protein held. Conditions are right for muscle growth.',
  CUTTING: 'Sustained caloric deficit with protein protected. Fat-loss conditions are present.',
  UNDERFUELLED: 'Intake is insufficient regardless of goal. Performance and recovery are at risk.',
  'PROTEIN-LIMITED': 'Calories are present but protein is the binding constraint. Macros are misaligned with your goal.',
  DRIFTING: 'Inputs are inconsistent. No clear pattern has formed. Course correction is needed.',
};

const INFO_PANEL_STYLE: React.CSSProperties = {
  marginTop: 10,
  padding: '10px 12px',
  background: 'var(--bg-2)',
  border: '1px solid var(--ink-4)',
  borderRadius: 6,
  fontSize: 11,
  fontFamily: 'var(--font-mono)',
  color: 'var(--ink-2)',
  lineHeight: 1.65,
  cursor: 'default',
};

const INFO_LABEL_STYLE: React.CSSProperties = {
  fontSize: 9,
  letterSpacing: '0.1em',
  color: 'var(--ink-2)',
  marginBottom: 6,
  textTransform: 'uppercase',
};

export default function SignalHero({
  state,
  subtitle,
  delta,
  waveformDays = [],
  selectedDay = 6,
  baseline = 1850,
  onDaySelect,
  onWeekIntel,
  onMonthIntel,
}: SignalHeroProps) {
  const [showStateInfo, setShowStateInfo] = useState(false);
  const [showDeltaInfo, setShowDeltaInfo] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* STATE — clickable, shows signal explanation */}
      <div
        style={{ padding: '28px 24px 0', cursor: 'pointer' }}
        onClick={() => { setShowStateInfo(s => !s); setShowDeltaInfo(false); }}
      >
        <div className="text-display" style={{ userSelect: 'none' }}>{state}</div>
        {subtitle && (
          <div className="text-micro" style={{ marginTop: 8 }}>{subtitle}</div>
        )}

        {showStateInfo && (
          <div style={INFO_PANEL_STYLE} onClick={e => e.stopPropagation()}>
            <div style={INFO_LABEL_STYLE}>What is Signal</div>
            SIGNAL is Nouriq's daily read of what pattern your nutrition is creating — computed from the shape of your last 7 days, not a single day's performance.
            {STATE_DESCRIPTIONS[state] && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--ink-4)' }}>
                <span style={{ color: 'var(--ink-1)' }}>{state} — </span>
                {STATE_DESCRIPTIONS[state]}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Waveform */}
      <div style={{ marginTop: 20 }}>
        <Waveform
          days={waveformDays}
          selectedDay={selectedDay}
          baseline={baseline}
          onDaySelect={onDaySelect}
        />
      </div>

      {/* Intel links — week and month */}
      {(onWeekIntel || onMonthIntel) && (
        <div style={{ padding: '12px 24px 0', display: 'flex', gap: 20 }}>
          {onWeekIntel && (
            <button
              onClick={onWeekIntel}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', transition: 'color 150ms linear' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold-1)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}
            >
              WEEK INTEL →
            </button>
          )}
          {onMonthIntel && (
            <button
              onClick={onMonthIntel}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', transition: 'color 150ms linear' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold-1)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}
            >
              MONTH INTEL →
            </button>
          )}
        </div>
      )}

      {/* Delta or placeholder — clickable, explains what delta is */}
      <div
        style={{ padding: '16px 24px 24px', cursor: 'pointer' }}
        onClick={() => { setShowDeltaInfo(s => !s); setShowStateInfo(false); }}
      >
        {delta ? (
          <div className="text-body" style={{ color: 'var(--ink-1)', userSelect: 'none' }}>
            {delta}
          </div>
        ) : (
          <div
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink-2)',
              userSelect: 'none',
            }}
          >
            Delta forms after 3 days of logging
            <span style={{ color: 'var(--ink-3)', marginLeft: 4 }}>· what is delta?</span>
          </div>
        )}

        {showDeltaInfo && (
          <div style={{ ...INFO_PANEL_STYLE, marginTop: 8 }} onClick={e => e.stopPropagation()}>
            <div style={INFO_LABEL_STYLE}>What is Delta</div>
            DELTA is your 7-day rolling caloric deviation from your personal baseline, expressed as a percentage.
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--ink-4)' }}>
              Your baseline is the caloric equilibrium the system has observed from your actual logging history — not a TDEE formula, not a goal. It recalibrates as more data accumulates.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
