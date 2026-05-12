import { getMicroStatus } from '../lib/nutrition';

interface DayMicros {
  iron: number;
  calcium: number;
  vitaminD: number;
  vitaminB12: number;
  magnesium: number;
  zinc: number;
  potassium: number;
  sodium: number;
  isEstimated: boolean;
}

const MICRO_CONFIG: Array<{ key: keyof Omit<DayMicros, 'isEstimated'>; label: string; rdi: number; unit: string; microKey: string }> = [
  { key: 'iron',       label: 'Iron',      rdi: 18,   unit: 'mg', microKey: 'iron'       },
  { key: 'calcium',    label: 'Calcium',   rdi: 1000, unit: 'mg', microKey: 'calcium'    },
  { key: 'vitaminD',   label: 'Vit D',     rdi: 20,   unit: 'μg', microKey: 'vitaminD'   },
  { key: 'vitaminB12', label: 'B12',       rdi: 2.4,  unit: 'μg', microKey: 'vitaminB12' },
  { key: 'magnesium',  label: 'Magnesium', rdi: 420,  unit: 'mg', microKey: 'magnesium'  },
  { key: 'zinc',       label: 'Zinc',      rdi: 11,   unit: 'mg', microKey: 'zinc'       },
  { key: 'potassium',  label: 'Potassium', rdi: 3500, unit: 'mg', microKey: 'potassium'  },
  { key: 'sodium',     label: 'Sodium',    rdi: 2300, unit: 'mg', microKey: 'sodium'     },
];

const STATUS_COLOR: Record<string, string> = {
  green:  'var(--status-up)',
  yellow: 'var(--status-mid)',
  red:    'var(--status-down)',
  dim:    'var(--ink-2)',
};

interface Props {
  micros: DayMicros;
}

export default function MicroGrid({ micros }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {MICRO_CONFIG.map(({ key, label, rdi, unit, microKey }) => {
        const value = micros[key] as number;
        const pct = Math.min(value / rdi, 1);
        const status = getMicroStatus(microKey as Parameters<typeof getMicroStatus>[0], value);
        const color = STATUS_COLOR[status];
        const pctDisplay = value > 0 ? `${Math.round((value / rdi) * 100)}%` : '—';

        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 64, flexShrink: 0, fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
              {label}
            </div>
            <div style={{ flex: 1, height: 3, background: 'var(--bar-track)', borderRadius: 2, position: 'relative' }} aria-hidden>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${pct * 100}%`, background: color, borderRadius: 2, transition: 'width 320ms var(--ease-data) 80ms' }} />
            </div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', color, width: 36, textAlign: 'right' }}>
              {pctDisplay}
            </div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ink-2)', width: 48 }}>
              {value > 0 ? `${value}${unit}` : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}
