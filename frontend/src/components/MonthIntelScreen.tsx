import { useMonthIntel } from '../hooks/useIntel';
import { INTEL_LABEL } from '../lib/constants';
import { IntelLoading, IntelError, IntelSection, IntelInstruction, IntelProjection, IntelDivider } from './IntelPanel';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

function monthLabel(month: string): string {
  const [year, mon] = month.split('-');
  return new Date(Number(year), Number(mon) - 1, 1)
    .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    .toUpperCase();
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
  month: string; // "YYYY-MM"
  onClose: () => void;
}

export default function MonthIntelScreen({ month, onClose }: Props) {
  const { data, isLoading, isError } = useMonthIntel(month);

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
        <span style={{ ...mono, fontSize: 9, color: 'var(--ink-3)' }}>{monthLabel(month)}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '28px 20px 48px' }}>
        {isLoading && <IntelLoading />}
        {isError && <IntelError />}
        {data && (
          <>
            <div style={{ marginBottom: 24 }}>
              {data.metrics.avg_calories > 0 && data.metrics.baseline_kcal && (
                <StatRow
                  label="AVG CALORIES"
                  value={`${data.metrics.avg_calories.toLocaleString()} / ${(data.metrics.baseline_kcal as number).toLocaleString()} baseline`}
                />
              )}
              {data.metrics.avg_delta_pct !== null && (
                <StatRow
                  label="AVG DELTA"
                  value={`${(data.metrics.avg_delta_pct as number) > 0 ? '+' : ''}${data.metrics.avg_delta_pct}%`}
                />
              )}
              <StatRow label="PROTEIN" value={`${data.metrics.protein_adherence_pct}% adherence`} />
              <StatRow label="LOGGED" value={`${data.metrics.days_logged} of ${data.metrics.total_days_in_month} days`} />
              {(data.metrics.training_sessions_count as number) > 0 && (
                <StatRow label="TRAINING" value={`${data.metrics.training_sessions_count} sessions`} />
              )}
              <StatRow label="DOMINANT STATE" value={String(data.metrics.dominant_state)} />
            </div>

            <IntelDivider />

            <IntelSection label="MONTH'S PATTERN">
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
    </div>
  );
}
