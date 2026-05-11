import { useState } from 'react';
import MacroRow from './MacroRow';
import MicroGrid from './MicroGrid';
import { useCountUp } from '../hooks/useCountUp';
import { getMicroStatus } from '../lib/nutrition';

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

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

interface TodayZoneProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  targets: MacroTargets;
  micros: DayMicros;
  aiInstruction: string | null;
}

const MICRO_RDI: Record<string, { label: string; rdi: number; key: keyof Omit<DayMicros, 'isEstimated'> }> = {
  iron:       { label: 'Iron',    rdi: 18,   key: 'iron'       },
  calcium:    { label: 'Calcium', rdi: 1000, key: 'calcium'    },
  vitaminD:   { label: 'Vit D',  rdi: 20,   key: 'vitaminD'   },
  vitaminB12: { label: 'B12',    rdi: 2.4,  key: 'vitaminB12' },
  magnesium:  { label: 'Mag',    rdi: 420,  key: 'magnesium'  },
  zinc:       { label: 'Zinc',   rdi: 11,   key: 'zinc'       },
  potassium:  { label: 'K',      rdi: 3500, key: 'potassium'  },
  sodium:     { label: 'Na',     rdi: 2300, key: 'sodium'     },
};

function getTopMicros(micros: DayMicros): Array<{ label: string; pct: number }> {
  const candidates = Object.entries(MICRO_RDI)
    .filter(([, cfg]) => (micros[cfg.key] as number) > 0)
    .map(([microKey, cfg]) => {
      const value = micros[cfg.key] as number;
      const pct = Math.round((value / cfg.rdi) * 100);
      const status = getMicroStatus(microKey as Parameters<typeof getMicroStatus>[0], value);
      return { label: cfg.label, pct, status };
    });

  if (candidates.length === 0) return [];

  // Sort: deficient first (red/yellow), then good (green)
  const deficient = candidates.filter(c => c.status === 'red' || c.status === 'yellow').sort((a, b) => a.pct - b.pct);
  const good = candidates.filter(c => c.status === 'green').sort((a, b) => b.pct - a.pct);

  return [...deficient.slice(0, 2), ...good.slice(0, 1)].slice(0, 3);
}

export default function TodayZone({ calories, protein, carbs, fat, fiber, targets, micros, aiInstruction }: TodayZoneProps) {
  const [macroExpanded, setMacroExpanded] = useState(false);
  const [microsExpanded, setMicrosExpanded] = useState(false);
  const animatedCal = useCountUp(calories);

  const day = new Date().toLocaleDateString('en-IN', { weekday: 'long' });
  const topMicros = getTopMicros(micros);
  const hasMicros = topMicros.length > 0;

  return (
    <div className="today-zone">
      {/* 2A — Daily Position */}
      <div className="today-daily-position px-5 py-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
            TODAY · {day}
          </div>
          <button
            onClick={() => setMacroExpanded(v => !v)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 3 }}
            aria-label={macroExpanded ? 'Collapse macro panel' : 'Expand macro panel'}
          >
            <span style={{ fontSize: 16, fontFamily: 'var(--font-mono)', fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: 'var(--ink-0)' }}>
              {animatedCal}
            </span>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)' }}>kcal</span>
          </button>
        </div>

        <MacroRow label="Protein" current={protein} target={targets.protein} unit="g" />

        {macroExpanded && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <MacroRow label="Carbs"    current={carbs}    target={targets.carbs}    unit="g" />
            <MacroRow label="Fat"      current={fat}      target={targets.fat}      unit="g" />
            <MacroRow label="Fiber"    current={fiber}    target={targets.fiber}    unit="g" />
            <MacroRow label="Calories" current={calories} target={targets.calories} unit="kcal" />
          </div>
        )}

        {aiInstruction && (
          <div style={{ marginTop: 10, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', lineHeight: 1.5 }}>
            → {aiInstruction}
          </div>
        )}
      </div>

      {/* 2B — Training placeholder */}
      <div className="today-training px-5 py-4">
        <div className="text-[9px] tracking-widest opacity-40">TRAINING · Not logged</div>
      </div>

      {/* 2C — Micros: absent when nothing logged */}
      {hasMicros && (
        <div className="today-micros px-5 py-4">
          <button
            onClick={() => setMicrosExpanded(v => !v)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
                MICROS
              </span>
              {topMicros.map(m => (
                <span key={m.label} style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ink-2)' }}>
                  · {m.label} {m.pct}%
                </span>
              ))}
              {micros.isEstimated && (
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', marginLeft: 4 }}>
                  est.
                </span>
              )}
            </div>
          </button>

          {microsExpanded && (
            <div style={{ marginTop: 12 }}>
              <MicroGrid micros={micros} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
