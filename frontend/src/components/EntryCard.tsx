import { useState } from 'react';
import type { Entry } from '../types';
import { MACRO_GOALS } from '../lib/nutrition';

interface Props {
  entry: Entry;
  onDelete: (entryId: string) => void;
  deleting?: boolean;
}

const MACROS: { key: 'protein' | 'carbs' | 'fat'; label: string }[] = [
  { key: 'protein', label: 'PROTEIN' },
  { key: 'carbs',   label: 'CARBS'   },
  { key: 'fat',     label: 'FAT'     },
];

export default function EntryCard({ entry, onDelete, deleting }: Props) {
  const [expanded, setExpanded] = useState(false);

  const name = entry.summary || entry.rawText.slice(0, 60);
  const { calories, protein, carbs, fat } = entry.totals;

  return (
    <div
      className="mb-2 cursor-pointer"
      style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--ink-4)',
        borderRadius: 12,
        transition: 'border-color 150ms',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--gold-1)')}
      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--ink-4)')}
      onClick={() => setExpanded(x => !x)}
    >
      {/* Collapsed header — always visible */}
      <div className="px-3 pt-3 pb-2.5">
        <div className="flex justify-between items-start gap-3 mb-1.5">
          <span className="text-body flex-1 min-w-0">{name}</span>
          <span className="text-data" style={{ flexShrink: 0 }}>{Math.round(calories)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-label">
            P {Math.round(protein)}g · C {Math.round(carbs)}g · F {Math.round(fat)}g
          </span>
          <span className="text-micro">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ borderTop: '1px solid var(--ink-4)' }}
          className="px-3 pb-3 pt-2.5"
        >
          {/* Macro progress rows — INK fill only, no color coding */}
          {MACROS.map(({ key, label }) => {
            const value = entry.totals[key];
            const pct   = Math.min((value / MACRO_GOALS[key]) * 100, 100);
            return (
              <div key={key} className="flex items-center gap-2 mb-2">
                <span className="text-label" style={{ width: 52, flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--bar-track)', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: 'var(--bar-fill)' }} />
                </div>
                <span className="text-micro" style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums', width: 28, textAlign: 'right' }}>
                  {Math.round(value)}g
                </span>
              </div>
            );
          })}

          {/* Per-item breakdown */}
          {entry.items?.length > 0 && (
            <div style={{ borderTop: '1px solid var(--ink-4)', marginTop: 8, paddingTop: 8 }}>
              {entry.items.map((item, i) => (
                <div key={i} className="flex justify-between items-baseline gap-2 mb-1">
                  <span style={{ fontSize: 11, fontFamily: '"DM Mono", monospace', color: 'var(--ink-2)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.mealLabel && (
                      <span style={{ marginRight: 6, color: 'var(--ink-3)' }}>[{item.mealLabel}]</span>
                    )}
                    {item.name}
                    {item.quantity && (
                      <span style={{ color: 'var(--ink-3)', marginLeft: 4 }}>{item.quantity}</span>
                    )}
                  </span>
                  <span className="text-micro" style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {item.calories}kcal
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer — timestamp + delete */}
          <div
            style={{ borderTop: '1px solid var(--ink-4)', marginTop: 8, paddingTop: 8 }}
            className="flex justify-between items-center"
          >
            <span className="text-micro">
              {new Date(entry.loggedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={() => onDelete(entry.entryId)}
              disabled={deleting}
              className="text-label"
              style={{
                color: 'var(--ink-3)',
                background: 'none',
                border: 'none',
                cursor: deleting ? 'not-allowed' : 'pointer',
                padding: 0,
                opacity: deleting ? 0.4 : 1,
                transition: 'color 150ms',
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
  );
}
