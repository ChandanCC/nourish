import { useDayIntel } from '../hooks/useIntel';
import { INTEL_LABEL } from '../lib/constants';
import { IntelLoading, IntelError, IntelSection, IntelInstruction, IntelDivider } from './IntelPanel';
import type { DayRating } from '../types';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

const RATING_COLOR: Record<DayRating, string> = {
  STRONG: 'var(--gold-1)',
  SOLID:  'var(--gold-1)',
  SHORT:  'var(--ink-2)',
  WEAK:   'var(--ink-2)',
};

interface Props {
  date: string;
  onClose: () => void;
}

export default function DayIntelScreen({ date, onClose }: Props) {
  const { data, isLoading, isError } = useDayIntel(date);

  const isToday = date === new Date().toISOString().split('T')[0];
  const dateLabel = isToday
    ? 'TODAY'
    : new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--bg-0)', display: 'flex', flexDirection: 'column', maxWidth: '32rem', margin: '0 auto' }}>
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
        <span style={{ ...mono, fontSize: 9, color: 'var(--ink-3)' }}>{dateLabel}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '28px 20px 48px' }}>
        {isLoading && <IntelLoading />}
        {isError && <IntelError />}
        {data && (
          <>
            {/* DAY RATING */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ ...mono, fontSize: 8, letterSpacing: '0.12em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 8 }}>
                DAY RATING
              </div>
              <div style={{ ...mono, fontSize: 22, letterSpacing: '0.08em', color: RATING_COLOR[data.dayRating], textTransform: 'uppercase' }}>
                {data.dayRating}
              </div>
            </div>

            <IntelDivider />

            <IntelSection label="WHAT WENT WELL">
              {data.metrics.whatWentWell}
            </IntelSection>

            <IntelSection label="WHAT TO IMPROVE">
              {data.metrics.whatToImprove}
            </IntelSection>

            {data.instruction && (
              <>
                <IntelDivider />
                <IntelInstruction text={data.instruction} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
