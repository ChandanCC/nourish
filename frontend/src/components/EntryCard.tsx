import { useState } from 'react';
import type { FoodEntry } from '../types';

interface Props {
  entry: FoodEntry;
  index: number;
  onDelete: (id: string) => void;
  deleting?: boolean;
}

const MACROS: { key: 'proteinG' | 'carbsG' | 'fatG'; label: string; target: number }[] = [
  { key: 'proteinG', label: 'PROTEIN', target: 160 },
  { key: 'carbsG',   label: 'CARBS',   target: 200 },
  { key: 'fatG',     label: 'FAT',     target: 55  },
];

export default function EntryCard({ entry, index, onDelete, deleting }: Props) {
  const [expanded, setExpanded] = useState(false);
  const delay = Math.min(index * 40, 400);

  return (
    <div
      className="mb-2 cursor-pointer"
      style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--ink-4)',
        borderRadius: 12,
        transition: 'border-color 150ms linear',
        animation: `entryArrival 200ms var(--ease-arrive) ${delay}ms both`,
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--gold-1)')}
      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--ink-4)')}
      onClick={() => setExpanded(x => !x)}
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

      {/* Expanded panel — always in DOM, height animated */}
      <div
        style={{
          maxHeight: expanded ? 300 : 0,
          overflow: 'hidden',
          transition: expanded
            ? 'max-height 220ms var(--ease-arrive)'
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
          {MACROS.map(({ key, label, target }) => {
            const value = entry[key];
            const pct = Math.min((value / target) * 100, 100);
            return (
              <div key={key} className="flex items-center gap-2 mb-2">
                <span className="text-label" style={{ width: 52, flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--bar-track)', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: 'var(--bar-fill)' }} />
                </div>
                <span className="text-micro" style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums', width: 28, textAlign: 'right' }}>
                  {value}g
                </span>
              </div>
            );
          })}

          {entry.parseNote && (
            <div
              className="text-micro"
              style={{ color: 'var(--ink-3)', marginTop: 6, marginBottom: 4 }}
            >
              {entry.parseNote}
            </div>
          )}

          <div
            style={{ borderTop: '1px solid var(--ink-4)', marginTop: 8, paddingTop: 8 }}
            className="flex justify-between items-center"
          >
            <span className="text-micro">
              {new Date(entry.loggedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={() => onDelete(entry._id)}
              disabled={deleting}
              className="text-label"
              style={{
                color: 'var(--ink-3)',
                background: 'none',
                border: 'none',
                cursor: deleting ? 'not-allowed' : 'pointer',
                padding: 0,
                opacity: deleting ? 0.4 : 1,
                transition: 'color 150ms linear',
              }}
              onMouseEnter={e => !deleting && ((e.currentTarget as HTMLButtonElement).style.color = 'var(--status-down)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-3)')}
            >
              {deleting ? '…' : 'DELETE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
