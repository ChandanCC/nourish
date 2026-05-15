import { useSessionIntel } from '../hooks/useIntel';
import { INTEL_LABEL } from '../lib/constants';
import { IntelLoading, IntelError, IntelSection, IntelInstruction, IntelDivider } from './IntelPanel';

const ACTIVITY_LABELS: Record<string, string> = {
  gym: 'GYM', run: 'RUN', cycle: 'CYCLE', swim: 'SWIM', sport: 'SPORT', other: 'OTHER',
};

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

interface Props {
  sessionId: string;
  activityType: string;
  date: string;
  onClose: () => void;
}

export default function SessionIntelScreen({ sessionId, activityType, date, onClose }: Props) {
  const { data, isLoading, isError } = useSessionIntel(sessionId);

  const label = ACTIVITY_LABELS[activityType] ?? activityType.toUpperCase();
  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();

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
        <span style={{ ...mono, fontSize: 9, color: 'var(--ink-3)' }}>
          {label} · {dateLabel}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '28px 20px 48px' }}>
        {isLoading && <IntelLoading />}
        {isError && <IntelError />}
        {data && (
          <>
            <IntelSection label="SESSION ASSESSMENT">
              {data.narrative}
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
