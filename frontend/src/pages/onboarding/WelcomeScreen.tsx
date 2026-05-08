interface Props {
  onContinue: () => void;
}

export default function WelcomeScreen({ onContinue }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-0)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 24px',
      }}
    >
      <div style={{ maxWidth: 480, width: '100%', margin: '0 auto' }}>
        <div className="text-display" style={{ marginBottom: 12 }}>NOURIQ</div>
        <div
          style={{
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            color: 'var(--ink-2)',
            marginBottom: 48,
          }}
        >
          Precision nutrition intelligence.
        </div>
        <button
          onClick={onContinue}
          style={{
            background: 'var(--bg-2)',
            color: 'var(--ink-1)',
            border: '1px solid var(--ink-4)',
            borderRadius: 12,
            padding: '14px 28px',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            fontWeight: 400,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Get started
        </button>
      </div>
    </div>
  );
}
