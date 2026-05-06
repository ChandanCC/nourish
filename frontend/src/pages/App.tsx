import { useState, useRef } from 'react';
import { useHistory, useDay, useAddEntry, useDeleteEntry } from '../hooks/useLogs';
import { MACRO_GOALS, MICRO_GROUPS, STATUS_STYLES, getMacroStatus, getMicroStatus, getTodayKey, formatDate, detectDateFromText, analyseFood } from '../lib/nutrition';
import MacroCard from '../components/MacroCard';
import MicroChip from '../components/MicroChip';
import EntryCard from '../components/EntryCard';
import WeeklySummary from '../components/WeeklySummary';
import type { Micros } from '../types';

const MICRO_KEYS = Object.keys(MICRO_GROUPS).flatMap(g => MICRO_GROUPS[g]) as (keyof Micros)[];

export default function App() {
  const [activeDay, setActiveDay] = useState(getTodayKey());
  const [tab, setTab]             = useState<'macros' | 'micros' | 'week'>('macros');
  const [input, setInput]         = useState('');
  const [analysing, setAnalysing] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isToday = activeDay === getTodayKey();

  const { data: history = [] }                       = useHistory(15);
  const { data: dayData, isLoading: dayLoading }     = useDay(activeDay);
  const addEntry    = useAddEntry(activeDay);
  const deleteEntry = useDeleteEntry(activeDay);

  const totals  = dayData?.dailyTotals || { calories:0, protein:0, carbs:0, fat:0, fiber:0 };
  const micros  = (dayData?.dailyMicros || {}) as Micros;
  const entries = dayData?.entries || [];

  const hasAnyMicro  = MICRO_KEYS.some(k => (micros[k] || 0) > 0);
  const greenMicros  = hasAnyMicro ? MICRO_KEYS.filter(k => getMicroStatus(k, micros[k]||0)==='green').length  : 0;
  const yellowMicros = hasAnyMicro ? MICRO_KEYS.filter(k => getMicroStatus(k, micros[k]||0)==='yellow').length : 0;
  const redMicros    = hasAnyMicro ? MICRO_KEYS.filter(k => getMicroStatus(k, micros[k]||0)==='red').length    : 0;

  const historyKeys = history.map(d => d.dateKey);
  const allDays = [getTodayKey(), ...historyKeys.filter(k => k !== getTodayKey())].slice(0, 15);

  async function handleLog() {
    if (!input.trim() || analysing) return;
    setAnalysing(true); setError(null);
    try {
      const parsed    = await analyseFood(input);
      const targetDay = detectDateFromText(input);
      await addEntry.mutateAsync({
        rawText: input,
        summary: parsed.summary || '',
        items:   parsed.items   || [],
        totals:  parsed.totals  || { calories:0, protein:0, carbs:0, fat:0, fiber:0 },
        micros:  parsed.micros  || {},
      });
      setActiveDay(targetDay);
      setInput('');
      textareaRef.current?.focus();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setAnalysing(false);
    }
  }

  async function handleDelete(entryId: string) {
    setDeletingId(entryId);
    try { await deleteEntry.mutateAsync(entryId); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Delete failed'); }
    finally { setDeletingId(null); }
  }

  const calStatus = totals.calories > 0 ? getMacroStatus('calories', totals.calories) : 'dim';
  const calCol    = STATUS_STYLES[calStatus];
  const calPct    = Math.min((totals.calories / MACRO_GOALS.calories) * 100, 130);
  const calRem    = MACRO_GOALS.calories - totals.calories;

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto" style={{ background:'#0a0a0f', color:'#e8e6e0', fontFamily:"'DM Mono','Fira Mono',monospace" }}>

      {/* Header */}
      <div className="px-5 pt-4 pb-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-baseline gap-2.5 mb-3">
          <h1 className="font-display font-extrabold text-xl tracking-tight" style={{ color:'#ffc864' }}>NOURISH</h1>
          <span className="text-[9px] opacity-30 tracking-widest">NUTRITION LOG</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {allDays.map(day => {
            const dh = history.find(d => d.dateKey === day);
            return (
              <button key={day} onClick={() => setActiveDay(day)}
                className={`day-pill ${activeDay===day?'active':''}`}
                style={{ opacity: dh||day===getTodayKey()?1:0.3 }}>
                {day===getTodayKey()?'today':formatDate(day)}
                {dh && <span className="ml-1 text-[9px] opacity-40">{Math.round(dh.dailyTotals.calories)}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-5 pt-2.5">
        <button className={`tab-btn ${tab==='macros'?'active':''}`} onClick={() => setTab('macros')}>MACROS</button>
        <button className={`tab-btn ${tab==='micros'?'active':''}`} onClick={() => setTab('micros')}>
          MICROS
          {hasAnyMicro && (
            <span className="ml-2 text-[9px] inline-flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background:'#34d399' }}/>{greenMicros}
              <span className="inline-block w-1.5 h-1.5 rounded-full ml-0.5" style={{ background:'#fbbf24' }}/>{yellowMicros}
              <span className="inline-block w-1.5 h-1.5 rounded-full ml-0.5" style={{ background:'#f87171' }}/>{redMicros}
            </span>
          )}
        </button>
        <button className={`tab-btn ${tab==='week'?'active':''}`} onClick={() => setTab('week')}>WEEK</button>
      </div>

      {/* Macro panel */}
      {tab==='macros' && (
        <div className="px-5 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div className="rounded-xl p-3 mb-2" style={{ background:calCol.bg, border:`1px solid ${calCol.border}` }}>
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-extrabold text-3xl leading-none" style={{ color:calCol.text }}>{Math.round(totals.calories)}</span>
                  <span className="text-[11px] opacity-40">/ {MACRO_GOALS.calories} kcal</span>
                </div>
                <div className="text-[9px] opacity-30 tracking-widest mt-0.5">
                  {isToday?'CALORIES TODAY':formatDate(activeDay).toUpperCase()}
                </div>
              </div>
              <div className="text-[11px] opacity-75" style={{ color:calCol.text }}>
                {calRem>0?`${Math.round(calRem)} left`:`${Math.round(Math.abs(calRem))} over`}
              </div>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width:`${Math.min(calPct,100)}%`, background:calCol.bar }} />
            </div>
          </div>
          <div className="flex gap-2 mb-2">
            <MacroCard label="Protein" value={totals.protein} colorKey="protein" />
            <MacroCard label="Carbs"   value={totals.carbs}   colorKey="carbs" />
            <MacroCard label="Fat"     value={totals.fat}      colorKey="fat" />
          </div>
          <MacroCard label="Fiber" value={totals.fiber||0} colorKey="fiber" fullWidth />
        </div>
      )}

      {/* Micro panel */}
      {tab==='micros' && (
        <div className="px-5 py-3 overflow-y-auto max-h-72" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          {!hasAnyMicro ? (
            <div className="text-center opacity-20 py-6 text-[11px] tracking-widest">LOG FOOD TO SEE MICRONUTRIENTS</div>
          ) : (
            <>
              <div className="flex gap-3 mb-2 text-[10px] opacity-40 flex-wrap">
                <span><span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle" style={{ background:'#34d399' }}/>≥80% RDI</span>
                <span><span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle" style={{ background:'#fbbf24' }}/>40–80%</span>
                <span><span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle" style={{ background:'#f87171' }}/>&lt;40% · sodium &gt;100%</span>
              </div>
              {Object.entries(MICRO_GROUPS).map(([group, keys]) => (
                <div key={group}>
                  <div className="text-[9px] tracking-widest opacity-30 uppercase my-2">{group}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(keys as (keyof Micros)[]).map(k => (
                      <MicroChip key={k} microKey={k} value={micros[k]||0} />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-5 my-2 px-3 py-2 rounded-lg text-[10px] leading-relaxed break-words"
          style={{ background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.2)', color:'#f87171' }}>
          <strong>Error:</strong> {error}
          <span className="ml-2 cursor-pointer opacity-50" onClick={() => setError(null)}>✕</span>
        </div>
      )}

      {/* Content — week summary or day entries */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'week' ? (
          <WeeklySummary history={history} />
        ) : (
          <div className="px-5 py-3">
            {dayLoading ? (
              <div className="text-center opacity-20 py-8 text-[11px] tracking-widest">LOADING...</div>
            ) : entries.length > 0 ? (
              [...entries].reverse().map(entry => (
                <EntryCard key={entry.entryId} entry={entry} onDelete={handleDelete} deleting={deletingId===entry.entryId} />
              ))
            ) : (
              <div className="text-center opacity-15 py-10 text-[11px] tracking-widest">
                {isToday?'NOTHING LOGGED TODAY YET':`NO DATA FOR ${formatDate(activeDay).toUpperCase()}`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 pb-6 pt-3" style={{ borderTop:'1px solid rgba(255,255,255,0.06)', background:'#0a0a0f' }}>
        <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter'&&(e.metaKey||e.ctrlKey)) handleLog(); }}
          placeholder={'What did you eat?\n\n"2 eggs, banana, oats for breakfast"\n"yesterday dinner: dal rice sabzi roti"'}
          rows={3}
          className="w-full rounded-xl px-3.5 py-3 text-[12px] leading-relaxed outline-none transition-colors duration-200"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'#e8e6e0', resize:'none' }}
          onFocus={e => (e.target.style.borderColor='rgba(255,200,100,0.3)')}
          onBlur={e  => (e.target.style.borderColor='rgba(255,255,255,0.1)')}
        />
        <div className="flex justify-between items-center mt-2.5">
          <span className="text-[9px] opacity-20 tracking-wide">⌘↩ to log</span>
          <button onClick={handleLog} disabled={analysing||!input.trim()}
            className="bg-[#ffc864] text-[#0a0a0f] font-display font-extrabold text-[13px] tracking-widest rounded-xl px-6 py-3 transition-all duration-200 hover:bg-[#ffd98a] hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed">
            {analysing ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full border-2 border-black/20 border-t-[#0a0a0f] animate-spin" />
                Analysing...
              </span>
            ) : 'LOG IT'}
          </button>
        </div>
      </div>
    </div>
  );
}
