import type { AuthUser } from '../lib/auth';

interface SignalHeroProps {
  state: string;
  subtitle?: string;
  delta?: string | null;
  isCollapsed: boolean;
  user: AuthUser | null;
  onLogout: () => void;
}

export default function SignalHero({
  state,
  subtitle,
  delta,
  isCollapsed,
  user,
  onLogout,
}: SignalHeroProps) {
  if (isCollapsed) {
    return (
      <div
        style={{
          height: 44,
          background: 'var(--bg-1)',
          borderBottom: '1px solid var(--ink-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div>
          <span
            style={{
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              color: 'var(--ink-1)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {state}
          </span>
          {delta && (
            <>
              <span style={{ color: 'var(--ink-3)', margin: '0 6px' }}>·</span>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 400,
                  color: 'var(--ink-3)',
                }}
              >
                {delta}
              </span>
            </>
          )}
        </div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ fontSize: 10, color: 'var(--ink-3)', lineHeight: 1 }}
          aria-label="Scroll to top"
        >
          ↓
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '48vh', display: 'flex', flexDirection: 'column' }}>
      {/* Wordmark + Avatar row */}
      <div
        style={{
          padding: '28px 24px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            letterSpacing: '0.15em',
            color: 'var(--ink-0)',
          }}
        >
          NOURIQ
        </span>
        <button onClick={onLogout} title={`Sign out (${user?.email ?? ''})`}>
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name ?? ''}
              style={{ width: 28, height: 28, borderRadius: '50%', opacity: 0.7 }}
            />
          ) : (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--ink-4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--ink-2)',
              }}
            >
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
        </button>
      </div>

      {/* STATE + subtitle */}
      <div style={{ padding: '24px 24px 0' }}>
        <div className="text-display">{state}</div>
        {subtitle && (
          <div className="text-micro" style={{ marginTop: 8 }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Waveform placeholder — full-bleed, replaced by Waveform component in P02-003 */}
      <div
        style={{
          marginTop: 20,
          height: 80,
          background: 'var(--bg-1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="text-micro">— waveform —</span>
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
