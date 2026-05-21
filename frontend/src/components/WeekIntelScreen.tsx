import { useWeekIntel } from '../hooks/useIntel';
import { INTEL_LABEL } from '../lib/constants';
import { IntelLoading, IntelError, IntelSection, IntelInstruction, IntelProjection, IntelDivider } from './IntelPanel';
import IntelChat from './IntelChat';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

function getWeekLabel(weekOf: string): { weekNum: number; range: string } {
  const d = new Date(weekOf + 'T00:00:00');
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  // ISO week number
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  const fmt = (dt: Date) => dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
  return { weekNum, range: `${fmt(mon)} – ${fmt(sun)}` };
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid var(--ink-4)' }}>
      <span style={{ ...mono, fontSize: 9, letterSpacing: '0.08em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ ...mono, fontSize: 11, color: 'var(--ink-1)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

interface Props {
  weekOf: string;
  onClose: () => void;
}

export default function WeekIntelScreen({ weekOf, onClose }: Props) {
  const { data, isLoading, isError } = useWeekIntel(weekOf);
  const { weekNum, range } = getWeekLabel(weekOf);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'var(--bg-0)', display: 'flex', flexDirection: 'column', maxWidth: '32rem', margin: '0 auto' }}>
      <div style={{ height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid var(--ink-4)' }}>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px 0', minHeight: 44, ...mono, fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.06em' }}
        >
          ← BACK
        </button>
        <span style={{ ...mono, fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>
          {INTEL_LABEL}
        </span>
        <span style={{ ...mono, fontSize: 9, color: 'var(--ink-3)' }}>WEEK {weekNum}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '28px 20px 20px' }}>
        <div style={{ ...mono, fontSize: 9, letterSpacing: '0.08em', color: 'var(--ink-3)', marginBottom: 20 }}>
          {range}
        </div>

        {isLoading && <IntelLoading />}
        {isError && <IntelError />}
        {data && (
          <>
            {/* Stats */}
            <div style={{ marginBottom: 24 }}>
              <StatRow label="SIGNAL" value={`${data.metrics.signal_state}${data.metrics.state_days_count > 0 ? `  (${data.metrics.state_days_count} of 7)` : ''}`} />
              {data.metrics.avg_delta_pct !== null && (
                <StatRow
                  label="AVG DELTA"
                  value={`${data.metrics.avg_delta_pct > 0 ? '+' : ''}${data.metrics.avg_delta_pct}%`}
                />
              )}
              <StatRow label="PROTEIN" value={`${data.metrics.protein_adherence_pct}% adherence`} />
              <StatRow label="LOGGED" value={`${data.metrics.days_logged} of 7 days`} />
              {data.metrics.training_sessions_count > 0 && (
                <StatRow label="TRAINING" value={`${data.metrics.training_sessions_count} sessions`} />
              )}
            </div>

            <IntelDivider />

            <IntelSection label="WEEK'S PATTERN">
              {data.narrative}
            </IntelSection>

            {data.instruction && (
              <>
                <IntelDivider />
                <IntelInstruction text={data.instruction} />
              </>
            )}
            {data.projection && <IntelProjection text={data.projection} />}
          </>
        )}
      </div>
      {data && <IntelChat level="weekly" contextData={data as unknown as Record<string, unknown>} />}
    </div>
  );
}
