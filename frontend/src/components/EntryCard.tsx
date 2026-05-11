import { useState } from 'react';
import type { FoodEntry } from '../types';
import type { EditEntryPayload } from '../api/client';
import { analyseFood } from '../lib/nutrition';

interface Props {
  entry: FoodEntry;
  index: number;
  onDelete: (id: string) => void;
  onEdit: (id: string, payload: EditEntryPayload) => void;
  deleting?: boolean;
  editing?: boolean;
}


const ENTRY_MICROS: {
  key: keyof Pick<FoodEntry, 'ironMg'|'calciumMg'|'vitaminDMcg'|'vitaminB12Mcg'|'magnesiumMg'|'zincMg'|'potassiumMg'|'sodiumMg'>;
  label: string; rdi: number; unit: string; microKey: string;
}[] = [
  { key: 'ironMg',        label: 'Iron',     rdi: 18,   unit: 'mg', microKey: 'iron'       },
  { key: 'calciumMg',     label: 'Calcium',  rdi: 1000, unit: 'mg', microKey: 'calcium'    },
  { key: 'vitaminDMcg',   label: 'Vit D',    rdi: 20,   unit: 'μg', microKey: 'vitaminD'   },
  { key: 'vitaminB12Mcg', label: 'B12',      rdi: 2.4,  unit: 'μg', microKey: 'vitaminB12' },
  { key: 'magnesiumMg',   label: 'Mag',      rdi: 420,  unit: 'mg', microKey: 'magnesium'  },
  { key: 'zincMg',        label: 'Zinc',     rdi: 11,   unit: 'mg', microKey: 'zinc'       },
  { key: 'potassiumMg',   label: 'Potassium',rdi: 3500, unit: 'mg', microKey: 'potassium'  },
  { key: 'sodiumMg',      label: 'Sodium',   rdi: 2300, unit: 'mg', microKey: 'sodium'     },
];

// Micro source quality — characterises the food, not the user's day
function microSourceColor(pct: number): string {
  if (pct >= 0.20) return 'var(--status-up)';   // significant source
  if (pct >= 0.10) return 'var(--status-mid)';  // moderate source
  return 'var(--ink-3)';                          // minor contribution
}

export default function EntryCard({ entry, index, onDelete, onEdit, deleting, editing }: Props) {
  const [expanded,   setExpanded]   = useState(false);
  const [activeTab,  setActiveTab]  = useState<'macros' | 'micros'>('macros');
  const [editMode,   setEditMode]   = useState(false);
  const [draftInput, setDraftInput] = useState(entry.rawInput);
  const [analysing,  setAnalysing]  = useState(false);
  const [editError,  setEditError]  = useState<string | null>(null);

  const delay = Math.min(index * 40, 400);

  const activeMicros = ENTRY_MICROS.filter(m => (entry[m.key] as number) > 0);
  const hasMicros    = activeMicros.length > 0;

  function openEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setDraftInput(entry.rawInput);
    setEditError(null);
    setExpanded(true);
    setEditMode(true);
  }

  function cancelEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setEditMode(false);
    setEditError(null);
  }

  async function saveEdit(e: React.MouseEvent) {
    e.stopPropagation();
    const text = draftInput.trim();
    if (!text || analysing) return;
    setAnalysing(true);
    setEditError(null);
    try {
      const parsed = await analyseFood(text);
      onEdit(entry._id, {
        rawInput:      text,
        name:          parsed.name,
        calories:      parsed.calories,
        proteinG:      parsed.protein,
        carbsG:        parsed.carbs,
        fatG:          parsed.fat,
        fiberG:        parsed.fiber,
        parseNote:     parsed.note,
        parsedByModel: parsed.parsedByModel,
        ironMg:        parsed.ironMg,
        calciumMg:     parsed.calciumMg,
        vitaminDMcg:   parsed.vitaminDMcg,
        vitaminB12Mcg: parsed.vitaminB12Mcg,
        magnesiumMg:   parsed.magnesiumMg,
        zincMg:        parsed.zincMg,
        potassiumMg:   parsed.potassiumMg,
        sodiumMg:      parsed.sodiumMg,
      });
      setEditMode(false);
    } catch {
      setEditError('Parse failed. Try again.');
    } finally {
      setAnalysing(false);
    }
  }

  return (
    <div
      className="mb-2"
      style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--ink-4)',
        borderRadius: 12,
        transition: 'border-color 150ms linear',
        animation: `entryArrival 200ms var(--ease-arrive) ${delay}ms both`,
        cursor: editMode ? 'default' : 'pointer',
      }}
      onMouseEnter={e => !editMode && ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--gold-1)')}
      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--ink-4)')}
      onClick={() => { if (!editMode) setExpanded(x => !x); }}
    >
      {/* Collapsed header */}
      <div className="px-3 pt-3 pb-2.5">
        <div className="flex justify-between items-start gap-3 mb-1.5">
          <span className="text-body flex-1 min-w-0">{entry.name}</span>
          <span className="text-data" style={{ flexShrink: 0 }}>{entry.calories}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-label">
            P {entry.proteinG}g · C {entry.carbsG}g · F {entry.fatG}g
          </span>
          <span className="text-micro">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded panel */}
      <div
        style={{
          maxHeight: expanded ? (editMode ? 300 : 440) : 0,
          overflow: 'hidden',
          transition: expanded
            ? 'max-height 260ms var(--ease-arrive)'
            : 'max-height 200ms var(--ease-depart)',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            borderTop: '1px solid var(--ink-4)',
            opacity: expanded ? 1 : 0,
            transition: expanded ? 'opacity 150ms linear 80ms' : 'opacity 100ms linear',
          }}
          className="px-3 pb-3 pt-2.5"
        >
          {/* rawInput */}
          {entry.rawInput && (
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', marginBottom: 10, lineHeight: 1.5, wordBreak: 'break-word' }}>
              "{entry.rawInput}"
            </div>
          )}

          {editMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea
                value={draftInput}
                onChange={e => setDraftInput(e.target.value)}
                onClick={e => e.stopPropagation()}
                autoFocus
                rows={3}
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--ink-4)',
                  borderRadius: 6,
                  color: 'var(--ink-0)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  padding: '8px 10px',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: 1.6,
                  width: '100%',
                }}
              />
              {editError && (
                <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--status-down)' }}>
                  {editError}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, alignItems: 'center' }}>
                {analysing && (
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
                    ANALYSING…
                  </span>
                )}
                <button
                  onClick={cancelEdit}
                  disabled={analysing}
                  style={{ background: 'none', border: 'none', cursor: analysing ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.06em', opacity: analysing ? 0.4 : 1 }}
                >
                  CANCEL
                </button>
                <button
                  onClick={saveEdit}
                  disabled={analysing || !draftInput.trim()}
                  style={{
                    background: 'none', border: 'none',
                    cursor: analysing || !draftInput.trim() ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em',
                    color: analysing || !draftInput.trim() ? 'var(--ink-3)' : 'var(--gold-1)',
                    opacity: analysing || !draftInput.trim() ? 0.4 : 1,
                  }}
                >
                  SAVE
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tab bar — only shown when micros exist */}
              {hasMicros && (
                <div style={{ display: 'flex', gap: 16, marginBottom: 10, borderBottom: '1px solid var(--ink-4)', paddingBottom: 6 }}>
                  {(['macros', 'micros'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={e => { e.stopPropagation(); setActiveTab(tab); }}
                      style={{
                        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: activeTab === tab ? 'var(--ink-0)' : 'var(--ink-3)',
                        borderBottom: activeTab === tab ? '1px solid var(--gold-1)' : '1px solid transparent',
                        paddingBottom: 4,
                        transition: 'color 120ms linear',
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}

              {/* Macros tab — caloric composition, no daily-goal reference */}
              {(!hasMicros || activeTab === 'macros') && (() => {
                const pCal  = entry.proteinG * 4;
                const cCal  = entry.carbsG   * 4;
                const fCal  = entry.fatG     * 9;
                const total = pCal + cCal + fCal || 1;
                const pPct  = Math.round((pCal / total) * 100);
                const cPct  = Math.round((cCal / total) * 100);
                const fPct  = Math.round((fCal / total) * 100);
                return (
                  <>
                    {/* Composition bar */}
                    <div style={{ display: 'flex', gap: 2, height: 5, borderRadius: 3, overflow: 'hidden', background: 'var(--bar-track)', marginBottom: 8 }}>
                      {pCal > 0 && <div style={{ flex: pCal, background: 'var(--ink-0)' }} />}
                      {cCal > 0 && <div style={{ flex: cCal, background: 'var(--ink-2)' }} />}
                      {fCal > 0 && <div style={{ flex: fCal, background: 'var(--ink-3)' }} />}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: entry.fiberG > 0 || entry.parseNote ? 6 : 0 }}>
                      {[
                        { label: 'P', value: entry.proteinG, pct: pPct, color: 'var(--ink-0)' },
                        { label: 'C', value: entry.carbsG,   pct: cPct, color: 'var(--ink-2)' },
                        { label: 'F', value: entry.fatG,     pct: fPct, color: 'var(--ink-3)' },
                      ].map(({ label, value, pct, color }) => (
                        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.06em' }}>{label}</span>
                          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', color }}>{value}g</span>
                          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)' }}>{pct}%</span>
                        </div>
                      ))}
                    </div>

                    {entry.fiberG > 0 && (
                      <div className="text-micro" style={{ color: 'var(--ink-3)' }}>
                        Fiber {entry.fiberG}g
                      </div>
                    )}
                    {entry.parseNote && (
                      <div className="text-micro" style={{ color: 'var(--ink-3)', marginTop: 2 }}>
                        {entry.parseNote}
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Micros tab — source quality, not daily-goal progress */}
              {hasMicros && activeTab === 'micros' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {activeMicros.map(({ key, label, rdi, unit }) => {
                    const value = entry[key] as number;
                    const pct   = Math.min(value / rdi, 1);
                    const color = microSourceColor(value / rdi);
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 56, flexShrink: 0, fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
                          {label}
                        </div>
                        <div style={{ flex: 1, height: 3, background: 'var(--bar-track)', borderRadius: 2, position: 'relative' }} aria-hidden>
                          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${pct * 100}%`, background: color, borderRadius: 2, transition: 'width 320ms var(--ease-data) 80ms' }} />
                        </div>
                        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', color, width: 32, textAlign: 'right' }}>
                          {Math.round((value / rdi) * 100)}%
                        </div>
                        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', width: 44 }}>
                          {value}{unit}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Footer */}
          {!editMode && (
            <div style={{ borderTop: '1px solid var(--ink-4)', marginTop: 10, paddingTop: 8 }} className="flex justify-between items-center">
              <span className="text-micro">
                {new Date(entry.loggedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <button
                  onClick={openEdit}
                  className="text-label"
                  style={{ color: 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 150ms linear' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--gold-1)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-3)')}
                >
                  EDIT
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(entry._id); }}
                  disabled={deleting}
                  className="text-label"
                  style={{
                    color: 'var(--ink-3)', background: 'none', border: 'none',
                    cursor: deleting ? 'not-allowed' : 'pointer', padding: 0,
                    opacity: deleting ? 0.4 : 1, transition: 'color 150ms linear',
                  }}
                  onMouseEnter={e => !deleting && ((e.currentTarget as HTMLButtonElement).style.color = 'var(--status-down)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-3)')}
                >
                  {deleting ? '…' : 'DELETE'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
