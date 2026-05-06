import { useState } from 'react';
import type { Entry, Micros } from '../types';
import { MICRO_RDI, STATUS_STYLES, getMicroStatus, getMacroStatus } from '../lib/nutrition';

interface Props {
  entry: Entry;
  onDelete: (entryId: string) => void;
  deleting?: boolean;
}

export default function EntryCard({ entry, onDelete, deleting }: Props) {
  const [expanded, setExpanded] = useState(false);
  const calStatus = getMacroStatus('calories', entry.totals.calories);
  const calCol    = STATUS_STYLES[calStatus];

  const microKeys = Object.keys(MICRO_RDI) as (keyof Micros)[];
  const hasMicros = microKeys.some(k => (entry.micros?.[k] || 0) > 0);

  return (
    <div
      className="group rounded-xl p-3 mb-2 cursor-pointer transition-colors duration-200"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,200,100,0.2)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
      onClick={() => setExpanded(x => !x)}
    >
      <div className="flex justify-between items-start gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] opacity-40 mb-1 italic truncate">
            {entry.summary || entry.rawText.slice(0, 55)}
          </div>
          <div className="flex gap-2 text-[11px] flex-wrap items-center">
            <span style={{ color: calCol.text }}>🔥 {Math.round(entry.totals.calories)}</span>
            <span style={{ color: '#4ecdc4' }}>P {Math.round(entry.totals.protein)}g</span>
            <span style={{ color: '#ffa552' }}>C {Math.round(entry.totals.carbs)}g</span>
            <span style={{ color: '#ff6b9d' }}>F {Math.round(entry.totals.fat)}g</span>
            {entry.totals.fiber > 0 && (
              <span style={{ color: '#a78bfa' }}>Fi {Math.round(entry.totals.fiber)}g</span>
            )}
          </div>
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-2 py-1 rounded-md cursor-pointer"
          style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', color: '#f87171' }}
          onClick={e => { e.stopPropagation(); onDelete(entry.entryId); }}
          disabled={deleting}
        >
          {deleting ? '…' : '✕'}
        </button>
      </div>

      {expanded && (
        <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} onClick={e => e.stopPropagation()}>
          {entry.items.map((item, i) => (
            <div key={i} className="flex justify-between items-start py-1.5 gap-2 text-[11px]"
              style={{ borderBottom: i < entry.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div className="flex-1 min-w-0">
                {item.mealLabel && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded mr-1 uppercase tracking-wide"
                    style={{ background: 'rgba(255,200,100,0.08)', color: 'rgba(255,200,100,0.65)', border: '1px solid rgba(255,200,100,0.15)' }}>
                    {item.mealLabel}
                  </span>
                )}
                <span className="opacity-85">{item.name}</span>
                <span className="opacity-30 ml-1.5 text-[10px]">{item.quantity}</span>
              </div>
              <div className="flex gap-1.5 opacity-50 flex-shrink-0">
                <span>{item.calories}cal</span>
                <span style={{ color: '#4ecdc4' }}>{item.protein}p</span>
                <span style={{ color: '#ffa552' }}>{item.carbs}c</span>
                <span style={{ color: '#ff6b9d' }}>{item.fat}f</span>
                {item.fiber > 0 && <span style={{ color: '#a78bfa' }}>{item.fiber}fi</span>}
              </div>
            </div>
          ))}
          {hasMicros && (
            <div className="mt-2 pt-2 flex flex-wrap gap-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {microKeys.filter(k => (entry.micros?.[k] || 0) > 0).map(k => {
                const col = STATUS_STYLES[getMicroStatus(k, entry.micros[k])];
                const v = entry.micros[k];
                return (
                  <span key={k} className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}` }}>
                    {MICRO_RDI[k].label}: {v < 10 ? v.toFixed(1) : Math.round(v)}{MICRO_RDI[k].unit}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="text-[9px] opacity-20 mt-1.5 text-right">
        {new Date(entry.loggedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        {entry.items.length > 0 && <span className="ml-1">{expanded ? '▲' : '▼'}</span>}
      </div>
    </div>
  );
}
