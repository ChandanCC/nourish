import { useState, useEffect } from 'react';
import { useCountUp } from '../hooks/useCountUp';

interface MacroRowProps {
  label: string;
  current: number;
  target: number | null;
  unit: string;
}

function barColor(pct: number, isOver: boolean): string {
  if (isOver) return 'var(--status-down)';
  if (pct >= 0.8) return 'var(--status-up)';
  if (pct >= 0.4) return 'var(--status-mid)';
  return 'var(--ink-2)';
}

export default function MacroRow({ label, current, target, unit }: MacroRowProps) {
  const animated = useCountUp(current);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const rawPct = target ? current / target : 0;
  const pct    = Math.min(rawPct, 1);
  const isOver = target !== null && current > target;
  const color  = barColor(rawPct, isOver);

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
            width: mounted ? `${pct * 100}%` : '0%',
            background: color,
            borderRadius: 2,
            transition: 'width 320ms var(--ease-data) 80ms',
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
            color,
          }}
        >
          {animated}{unit}
        </span>
        {target !== null && (
          <span
            style={{
              fontSize: 8,
              fontFamily: 'var(--font-mono)',
              fontWeight: 400,
              color: 'var(--ink-2)',
            }}
          >
            {' '}/ {target}{unit}
          </span>
        )}
      </div>
    </div>
  );
}
