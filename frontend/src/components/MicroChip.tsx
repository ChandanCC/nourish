import type { Micros, StatusColor } from '../types';
import { MICRO_RDI, STATUS_STYLES, getMicroStatus } from '../lib/nutrition';

interface Props { microKey: keyof Micros; value: number; }

export default function MicroChip({ microKey, value }: Props) {
  const cfg    = MICRO_RDI[microKey];
  const status: StatusColor = value > 0 ? getMicroStatus(microKey, value) : 'dim';
  const col    = STATUS_STYLES[status];
  const pct    = Math.min((value / cfg.rdi) * 100, 100);
  const display = value < 10 ? value.toFixed(1) : Math.round(value);
  return (
    <div style={{ background: col.bg, border: `1px solid ${col.border}`, minWidth: 84 }}
      className="rounded-lg p-2 flex flex-col gap-1">
      <div className="text-[9px] tracking-wide opacity-50 uppercase leading-none">{cfg.label}</div>
      <div className="flex items-baseline gap-1">
        <span style={{ color: col.text }} className="text-sm font-medium leading-none">{display}</span>
        <span className="text-[9px] opacity-40">{cfg.unit}</span>
      </div>
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: col.bar }} />
      </div>
      <div className="text-[9px] opacity-32">{Math.round(pct)}%{cfg.invert ? ' ↓' : ''}</div>
    </div>
  );
}
