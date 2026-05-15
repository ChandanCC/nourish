import { useState, useEffect, useRef } from 'react';

interface WaveformDay {
  calories: number;
  isToday: boolean;
  label: string; // "MON", "TUE", etc.
}

interface WaveformProps {
  days: WaveformDay[];
  selectedDay: number; // 0–6 index
  baseline: number;    // kcal for height calculation
  onDaySelect?: (index: number) => void;
}

const BASELINE_Y = 40;
const MAX_SURPLUS = 38;
const MAX_DEFICIT = 22;
const BAR_AREA_H = 68;
const LABEL_H   = 16;
const CONTAINER_H = BAR_AREA_H + LABEL_H; // 84px
const READOUT_H = 24;
const TODAY_IDX = 6;

function surplusHeight(calories: number, baseline: number): number {
  if (calories <= baseline) return 0;
  return Math.min(((calories - baseline) / baseline) * MAX_SURPLUS * 2, MAX_SURPLUS);
}

function deficitHeight(calories: number, baseline: number): number {
  if (calories >= baseline) return 0;
  return Math.min(((baseline - calories) / baseline) * MAX_DEFICIT * 2, MAX_DEFICIT);
}

function buildReadout(day: WaveformDay, baseline: number): string {
  if (day.calories === 0) return 'no data logged';
  const diff = day.calories - baseline;
  const abs = Math.round(Math.abs(diff));
  if (abs < 25) return `${day.calories.toLocaleString()} kcal · at baseline`;
  const direction = diff > 0 ? `+${abs.toLocaleString()} above` : `−${abs.toLocaleString()} below`;
  return `${day.calories.toLocaleString()} kcal · ${direction} baseline`;
}

export default function Waveform({
  days,
  selectedDay = TODAY_IDX,
  baseline = 1850,
  onDaySelect,
}: WaveformProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [longPressIdx, setLongPressIdx] = useState<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressActivated = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  function startLongPress(i: number) {
    longPressActivated.current = false;
    if (dismissTimer.current) { clearTimeout(dismissTimer.current); dismissTimer.current = null; }
    longPressTimer.current = setTimeout(() => {
      longPressActivated.current = true;
      setLongPressIdx(i);
      dismissTimer.current = setTimeout(() => setLongPressIdx(null), 2500);
    }, 500);
  }

  function endLongPress() {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }

  function cancelLongPress() {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    if (dismissTimer.current) { clearTimeout(dismissTimer.current); dismissTimer.current = null; }
    longPressActivated.current = false;
    setLongPressIdx(null);
  }

  // Readout priority: desktop hover > mobile long-press > selected day
  const readoutIdx = hoveredDay ?? longPressIdx ?? selectedDay;
  const readoutDay = days[readoutIdx];

  const hasNonTodaySelected = selectedDay !== TODAY_IDX;

  return (
    <div style={{ width: '100%' }}>
      {/* Readout row — always present, shows hovered/selected bar info */}
      <div
        style={{
          height: READOUT_H,
          padding: '0 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.06em',
          opacity: readoutDay ? 1 : 0,
          transition: 'opacity 150ms linear',
          userSelect: 'none',
        }}
      >
        {readoutDay && (
          <>
            <span style={{ color: 'var(--ink-1)' }}>{readoutDay.isToday ? 'TODAY' : readoutDay.label}</span>
            <span style={{ color: 'var(--ink-3)' }}>·</span>
            <span style={{ color: 'var(--ink-2)' }}>{buildReadout(readoutDay, baseline)}</span>
          </>
        )}
      </div>

      {/* Bar area */}
      <div
        style={{
          width: '100%',
          height: CONTAINER_H,
          position: 'relative',
          display: 'flex',
        }}
      >
        {/* Baseline axis */}
        <div
          style={{
            position: 'absolute',
            top: BASELINE_Y,
            left: 0,
            right: 0,
            height: 1,
            background: 'var(--wave-baseline)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {days.map((day, i) => {
          const isSelected = i === selectedDay;
          const isHovered = i === hoveredDay;
          const isSurplus = day.calories > baseline;
          const isEmpty = day.calories === 0;

          const barH = isEmpty ? 0 : isSurplus
            ? surplusHeight(day.calories, baseline)
            : deficitHeight(day.calories, baseline);

          const barColor = day.isToday
            ? 'var(--wave-today)'
            : isSurplus
            ? 'var(--wave-surplus)'
            : 'var(--wave-deficit)';

          let barOpacity: number;
          if (isSelected) {
            barOpacity = 1;
          } else if (isHovered) {
            barOpacity = hasNonTodaySelected ? 0.55 : 0.8;
          } else if (hasNonTodaySelected) {
            barOpacity = day.isToday ? 0.45 : 0.3;
          } else {
            barOpacity = day.isToday ? 1 : 0.55;
          }

          const labelColor = day.isToday || isSelected
            ? 'var(--ink-1)'
            : isHovered
            ? 'var(--ink-2)'
            : 'var(--ink-3)';

          return (
            <div
              key={i}
              onClick={() => {
                if (longPressActivated.current) { longPressActivated.current = false; return; }
                onDaySelect?.(i);
              }}
              onMouseEnter={() => setHoveredDay(i)}
              onMouseLeave={() => setHoveredDay(null)}
              onTouchStart={() => startLongPress(i)}
              onTouchEnd={endLongPress}
              onTouchMove={cancelLongPress}
              style={{
                flex: 1,
                position: 'relative',
                cursor: 'pointer',
                height: CONTAINER_H,
                borderRadius: 3,
                background: isHovered ? 'rgba(232,227,216,0.03)' : 'transparent',
                transition: 'background 100ms linear',
              }}
              role="button"
              aria-label={`${day.label} ${isEmpty ? 'no data' : `${day.calories} kcal`}`}
              aria-pressed={isSelected}
            >
              {!isEmpty && barH > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 4,
                    right: 4,
                    ...(isSurplus
                      ? {
                          bottom: CONTAINER_H - BASELINE_Y,
                          height: mounted ? barH : 0,
                          borderRadius: '2px 2px 0 0',
                        }
                      : {
                          top: BASELINE_Y,
                          height: mounted ? barH : 0,
                          borderRadius: '0 0 2px 2px',
                        }),
                    background: barColor,
                    opacity: barOpacity,
                    transition: `height 300ms var(--ease-data) ${i * 30}ms, opacity 150ms linear`,
                    zIndex: 2,
                  }}
                />
              )}

              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: LABEL_H,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: isSelected || day.isToday ? 500 : 400,
                  letterSpacing: '0.06em',
                  color: labelColor,
                  transition: 'color 150ms linear',
                }}
              >
                {day.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
