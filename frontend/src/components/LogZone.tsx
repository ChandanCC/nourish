import EntryCard from './EntryCard';
import { getTodayKey } from '../lib/nutrition';
import type { FoodEntry } from '../types/index';
import type { EditEntryPayload } from '../api/client';

interface LogZoneProps {
  entries: FoodEntry[];
  isLoading: boolean;
  activeDay: string;
  deletingId: string | null;
  editingId: string | null;
  onDelete: (id: string) => void;
  onEdit: (id: string, payload: EditEntryPayload) => void;
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
}

export default function LogZone({ entries, isLoading, activeDay, deletingId, editingId, onDelete, onEdit }: LogZoneProps) {
  const isToday = activeDay === getTodayKey();

  return (
    <div className="log-zone px-5 py-3">
      {/* Past-day context header */}
      {!isToday && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: '1px solid var(--ink-4)',
        }}>
          <span style={{
            fontSize: 9,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.1em',
            color: 'var(--ink-3)',
          }}>
            {formatDayLabel(activeDay)}
          </span>
          {entries.length > 0 && (
            <span style={{
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink-4)',
            }}>
              · {entries.length} {entries.length === 1 ? 'ENTRY' : 'ENTRIES'}
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="text-center opacity-20 py-8 text-[11px] tracking-widest">LOADING...</div>
      ) : entries.length > 0 ? (
        entries.map((entry, i) => (
          <EntryCard
            key={entry._id}
            entry={entry}
            index={i}
            onDelete={onDelete}
            onEdit={onEdit}
            deleting={deletingId === entry._id}
            editing={editingId === entry._id}
          />
        ))
      ) : (
        <div className="text-center opacity-15 py-10 text-[11px] tracking-widest">
          {isToday ? 'NOTHING LOGGED TODAY YET' : 'NO DATA'}
        </div>
      )}
    </div>
  );
}
