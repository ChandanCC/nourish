import type { NutritionDay, Totals } from '../types';
import { MACRO_GOALS, STATUS_STYLES, getMacroStatus, formatDate } from '../lib/nutrition';

interface Props { history: NutritionDay[]; }

export default function WeeklySummary({ history }: Props) {
  const days = history.slice(0, 7);
  const logged = days.length;

  if (logged === 0) {
    return (
      <div className="text-center opacity-15 py-10 text-[11px] tracking-widest">
        NO DATA FOR THE PAST WEEK
      </div>
    );
  }

  const avgOf = (key: keyof Totals) =>
    days.reduce((s, d) => s + (d.dailyTotals[key] || 0), 0) / logged;

  const avgCal  = avgOf('calories');
  const avgProt = avgOf('protein');
  const avgCarb = avgOf('carbs');
  const avgFat  = avgOf('fat');
  const avgFib  = avgOf('fiber');

  const onTarget     = days.filter(d => getMacroStatus('calories', d.dailyTotals.calories) === 'green').length;
  const totalEntries = days.reduce((s, d) => s + d.entries.length, 0);

  const calStatus = avgCal > 0 ? getMacroStatus('calories', avgCal) : 'dim';
  const calCol    = STATUS_STYLES[calStatus];
  const calPct    = Math.min((avgCal / MACRO_GOALS.calories) * 100, 100);

  const macroRows = [
    { key: 'protein' as const, label: 'PROTEIN', value: avgProt },
    { key: 'carbs'   as const, label: 'CARBS',   value: avgCarb },
    { key: 'fat'     as const, label: 'FAT',      value: avgFat  },
  ];

  const chartDays = [...days].reverse();
  const maxCal = Math.max(...chartDays.map(d => d.dailyTotals.calories), MACRO_GOALS.calories);

  return (
    <div className="px-5 py-3 overflow-y-auto">

      {/* Average calorie card */}
      <div className="rounded-xl p-3 mb-2" style={{ background: calCol.bg, border: `1px solid ${calCol.border}` }}>
        <div className="text-[9px] opacity-30 tracking-widest mb-2">7-DAY AVERAGE</div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-extrabold text-3xl leading-none" style={{ color: calCol.text }}>
              {Math.round(avgCal)}
            </span>
            <span className="text-[11px] opacity-40">/ {MACRO_GOALS.calories} kcal</span>
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-[15px]" style={{ color: 'var(--gold)' }}>{onTarget}/{logged}</div>
            <div className="text-[8px] opacity-30 tracking-widest">ON TARGET</div>
          </div>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${calPct}%`, background: calCol.bar }} />
        </div>
      </div>

      {/* Avg macro cards */}
      <div className="flex gap-2 mb-2">
        {macroRows.map(({ key, label, value }) => {
          const pct = Math.min((value / MACRO_GOALS[key]) * 100, 100);
          const col = STATUS_STYLES[value > 0 ? getMacroStatus(key, value) : 'dim'];
          return (
            <div key={key} className="flex-1 rounded-lg p-2.5"
              style={{ background: 'var(--bg-1)', border: '1px solid var(--ink-4)' }}>
              <div className="text-[9px] opacity-30 tracking-widest mb-1">{label}</div>
              <div className="font-display font-bold text-lg leading-none" style={{ color: col.text }}>
                {Math.round(value)}g
              </div>
              <div className="h-0.5 rounded-full mt-1.5 overflow-hidden" style={{ background: 'var(--bar-track)' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: col.bar }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="flex gap-2 mb-4">
        {([
          { label: 'DAYS LOGGED', value: String(logged) },
          { label: 'ENTRIES',     value: String(totalEntries) },
          { label: 'AVG FIBER',   value: `${Math.round(avgFib)}g` },
        ] as const).map(({ label, value }) => (
          <div key={label} className="flex-1 rounded-lg p-2.5 text-center"
            style={{ background: 'var(--bg-1)', border: '1px solid var(--ink-4)' }}>
            <div className="font-display font-bold text-xl leading-none" style={{ color: 'var(--ink-0)' }}>{value}</div>
            <div className="text-[8px] opacity-30 tracking-widest mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Daily bar chart */}
      <div className="text-[9px] opacity-30 tracking-widest mb-2">DAILY BREAKDOWN</div>
      <div className="flex gap-1.5 items-end" style={{ height: '72px' }}>
        {chartDays.map(d => {
          const barH = Math.max(Math.round((d.dailyTotals.calories / maxCal) * 56), 2);
          const col  = STATUS_STYLES[d.dailyTotals.calories > 0 ? getMacroStatus('calories', d.dailyTotals.calories) : 'dim'];
          const label = formatDate(d.dateKey).split(',')[0];
          return (
            <div key={d.dateKey} className="flex-1 flex flex-col justify-end items-center gap-1">
              <div className="text-[8px] opacity-30">{Math.round(d.dailyTotals.calories)}</div>
              <div className="w-full rounded-t-sm" style={{ height: `${barH}px`, background: col.bar, opacity: 0.75 }} />
              <div className="text-[8px] opacity-30 leading-none">{label}</div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
