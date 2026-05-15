import { useMealIntel } from '../hooks/useIntel';
import { INTEL_LABEL } from '../lib/constants';
import { IntelLoading, IntelError, IntelSection, IntelDivider, IntelInstruction } from './IntelPanel';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

interface Props {
  entryId: string;
  mealName: string;
  onClose: () => void;
}

export default function MealIntelScreen({ entryId, mealName, onClose }: Props) {
  const { data, isLoading, isError } = useMealIntel(entryId);

  const truncated = mealName.length > 28 ? mealName.slice(0, 28) + '…' : mealName;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--bg-0)', display: 'flex', flexDirection: 'column', maxWidth: '32rem', margin: '0 auto' }}>
      {/* Header */}
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
        <span style={{ ...mono, fontSize: 9, color: 'var(--ink-3)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {truncated}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'], padding: '28px 20px 48px' }}>
        {isLoading && <IntelLoading />}
        {isError && <IntelError />}
        {data && (
          <>
            <IntelSection label="MEAL ASSESSMENT">
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
