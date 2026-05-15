import { INTEL_LABEL } from '../lib/constants';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

export function IntelLoading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 32 }}>
      <div style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
        GENERATING {INTEL_LABEL}...
      </div>
    </div>
  );
}

export function IntelError() {
  return (
    <div style={{ ...mono, fontSize: 10, letterSpacing: '0.08em', color: 'var(--ink-3)', paddingTop: 32, textTransform: 'uppercase' }}>
      Intel unavailable — try again
    </div>
  );
}

export function IntelSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ ...mono, fontSize: 8, letterSpacing: '0.12em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ ...mono, fontSize: 12, lineHeight: 1.6, color: 'var(--ink-2)' }}>
        {children}
      </div>
    </div>
  );
}

export function IntelInstruction({ text }: { text: string }) {
  return (
    <div style={{
      borderTop: '1px solid var(--ink-4)',
      paddingTop: 16,
      marginTop: 8,
      ...mono,
      fontSize: 11,
      lineHeight: 1.5,
      color: 'var(--ink-1)',
      letterSpacing: '0.02em',
    }}>
      {text}
    </div>
  );
}

export function IntelProjection({ text }: { text: string }) {
  return (
    <div style={{
      ...mono,
      fontSize: 10,
      lineHeight: 1.5,
      color: 'var(--ink-3)',
      marginTop: 12,
      letterSpacing: '0.02em',
    }}>
      {text}
    </div>
  );
}

export function IntelDivider() {
  return <div style={{ height: 1, background: 'var(--ink-4)', margin: '20px 0' }} />;
}
