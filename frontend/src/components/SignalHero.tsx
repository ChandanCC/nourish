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
  onDaySelect?: (index: number) => void;
}

export default function SignalHero({
  state,
  subtitle,
  delta,
  waveformDays = [],
  selectedDay = 0,
  onDaySelect,
}: SignalHeroProps) {
  return (
    <div style={{ minHeight: '40vh', display: 'flex', flexDirection: 'column' }}>
      {/* STATE + subtitle */}
      <div style={{ padding: '28px 24px 0' }}>
        <div className="text-display">{state}</div>
        {subtitle && (
          <div className="text-micro" style={{ marginTop: 8 }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Waveform — full-bleed */}
      <div style={{ marginTop: 20 }}>
        <Waveform
          days={waveformDays}
          selectedDay={selectedDay}
          baseline={1850}
          onDaySelect={onDaySelect}
        />
      </div>

      {/* Delta line */}
      {delta && (
        <div
          className="text-body"
          style={{ padding: '20px 24px 24px', color: 'var(--ink-1)' }}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
