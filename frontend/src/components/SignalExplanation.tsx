interface Props {
  onDismiss: () => void;
}

export default function SignalExplanation({ onDismiss }: Props) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        padding: '0 0 72px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          margin: '0 auto',
          background: 'var(--bg-1)',
          border: '1px solid var(--ink-4)',
          borderRadius: 16,
          padding: '24px 24px 20px',
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            color: 'var(--ink-1)',
            marginBottom: 8,
          }}
        >
          SIGNAL tracks your pattern
        </div>
        <div
          style={{
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            color: 'var(--ink-2)',
            marginBottom: 20,
          }}
        >
          Log meals for 7 days. Your baseline forms automatically.
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: '1px solid var(--ink-4)',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ink-2)',
            cursor: 'pointer',
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
