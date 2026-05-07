import MacroRow from './MacroRow';

export default function TodayZone() {
  return (
    <div className="today-zone">
      {/* 2A — Daily Position: protein row (default); full panel on calorie tap — P03+ */}
      <div className="today-daily-position px-5 py-4">
        <MacroRow label="Protein" current={89} target={140} unit="g" />
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
