export default function TodayZone() {
  return (
    <div className="today-zone">
      {/* 2A — Daily Position: macro rows (P02-005) */}
      <div className="today-daily-position px-5 py-4" />

      {/* 2B — Training: text-log placeholder (U-001 unresolved) */}
      <div className="today-training px-5 py-4">
        <div className="text-[9px] tracking-widest opacity-40">TRAINING · Not logged</div>
      </div>

      {/* 2C — Micros: deferred to v1.2 */}
      <div className="today-micros" />
    </div>
  );
}
