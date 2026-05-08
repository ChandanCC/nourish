import EntryCard from './EntryCard';
import { getTodayKey } from '../lib/nutrition';
import type { FoodEntry } from '../types/index';

interface LogZoneProps {
  entries: FoodEntry[];
  isLoading: boolean;
  activeDay: string;
  deletingId: string | null;
  onDelete: (id: string) => void;
}

export default function LogZone({ entries, isLoading, activeDay, deletingId, onDelete }: LogZoneProps) {
  const isToday = activeDay === getTodayKey();

  return (
    <div className="log-zone px-5 py-3">
      {isLoading ? (
        <div className="text-center opacity-20 py-8 text-[11px] tracking-widest">LOADING...</div>
      ) : entries.length > 0 ? (
        entries.map((entry, i) => (
          <EntryCard
            key={entry._id}
            entry={entry}
            index={i}
            onDelete={onDelete}
            deleting={deletingId === entry._id}
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
