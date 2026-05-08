import MacroRow from './MacroRow';

interface TodayZoneProps {
  protein: number;
  proteinTarget: number;
  aiInstruction: string | null;
}

export default function TodayZone({ protein, proteinTarget, aiInstruction }: TodayZoneProps) {
  return (
    <div className="today-zone">
      {/* 2A — Daily Position: protein row (default); full panel on calorie tap — P03+ */}
      <div className="today-daily-position px-5 py-4">
        <MacroRow label="Protein" current={protein} target={proteinTarget} unit="g" />

        {/* AI instruction line — absent when null (silence is the signal) */}
        {aiInstruction && (
          <div
            className="text-body"
            style={{ marginTop: 8, color: 'var(--ink-1)' }}
          >
            → {aiInstruction}
          </div>
        )}
      </div>

      {/* 2B — Training: text-log placeholder (U-001 unresolved) */}
      <div className="today-training px-5 py-4">
        <div className="text-[9px] tracking-widest opacity-40">TRAINING · Not logged</div>
      </div>

      {/* 2C — Micros: deferred to v1.2 */}
      <div className="today-micros" />
    </div>
  );
}
