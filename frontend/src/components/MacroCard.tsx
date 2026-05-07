import type { MacroKey, StatusColor } from '../types';
import { MACRO_GOALS, STATUS_STYLES, getMacroStatus } from '../lib/nutrition';

interface Props {
  label: string;
  value: number;
  colorKey: MacroKey;
  unit?: string;
  fullWidth?: boolean;
}

export default function MacroCard({ label, value, colorKey, unit = 'g', fullWidth }: Props) {
  const status: StatusColor = value > 0 ? getMacroStatus(colorKey, value) : 'dim';
  const col  = STATUS_STYLES[status];
  const goal = MACRO_GOALS[colorKey];
  const pct  = Math.min((value / goal) * 100, 130);
  const rem  = goal - value;
  return (
    <div style={{ background: col.bg, border: `1px solid ${col.border}`, flex: fullWidth ? undefined : 1 }}
      className={`rounded-xl p-2.5 min-w-0 ${fullWidth ? 'w-full' : ''}`}>
      <div className="text-[9px] tracking-widest opacity-50 uppercase mb-1">{label}</div>
      <div className="flex items-baseline gap-1 mb-1.5">
        <span style={{ color: col.text }} className="text-lg font-bold font-display leading-none">{Math.round(value)}</span>
        <span className="text-[9px] opacity-40">/{goal}{unit}</span>
      </div>
      <div className="h-[3px] rounded-full overflow-hidden mb-1" style={{ background: 'var(--bar-track)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, background: col.bar }} />
      </div>
      <div className="text-[9px] opacity-30">
        {rem > 0 ? `${Math.round(rem)}${unit} left` : `${Math.round(Math.abs(rem))}${unit} over`}
      </div>
    </div>
  );
}
