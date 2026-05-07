interface MacroRowProps {
  label: string;
  current: number;
  target: number | null;
  unit: string;
}

export default function MacroRow({ label, current, target, unit }: MacroRowProps) {
  const pct = target ? Math.min(current / target, 1) : 0;
  const isOver = target !== null && current > target;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 60,
          flexShrink: 0,
          fontSize: 9,
          fontFamily: 'var(--font-mono)',
          fontWeight: 400,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ink-2)',
        }}
      >
        {label}
      </div>

      <div
        style={{
          flex: 1,
          height: 3,
          background: 'var(--bar-track)',
          borderRadius: 2,
          position: 'relative',
        }}
        aria-hidden
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${pct * 100}%`,
            background: isOver ? 'rgba(232,227,216,0.90)' : 'var(--bar-fill)',
            borderRadius: 2,
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span
          style={{
            fontSize: 16,
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--ink-0)',
          }}
        >
          {current}{unit}
        </span>
        {target !== null && (
          <span
            style={{
              fontSize: 8,
              fontFamily: 'var(--font-mono)',
              fontWeight: 400,
              color: 'var(--ink-3)',
            }}
          >
            {' '}of {target}{unit}
          </span>
        )}
      </div>
    </div>
  );
}
