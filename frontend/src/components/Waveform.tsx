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

const BASELINE_Y = 40;   // px from top of bar area
const MAX_SURPLUS = 38;  // max pixels above baseline
const MAX_DEFICIT = 22;  // max pixels below baseline (leaves room for labels)
const BAR_AREA_H = 68;   // total height before labels
const LABEL_H   = 16;    // height reserved for day labels
const CONTAINER_H = BAR_AREA_H + LABEL_H; // 84px

function surplusHeight(calories: number, baseline: number): number {
  if (calories <= baseline) return 0;
  return Math.min(((calories - baseline) / baseline) * MAX_SURPLUS * 2, MAX_SURPLUS);
}

function deficitHeight(calories: number, baseline: number): number {
  if (calories >= baseline) return 0;
  return Math.min(((baseline - calories) / baseline) * MAX_DEFICIT * 2, MAX_DEFICIT);
}

const MOCK_DAYS: WaveformDay[] = [
  { calories: 1620, isToday: false, label: 'MON' },
  { calories: 1850, isToday: false, label: 'TUE' },
  { calories: 2180, isToday: false, label: 'WED' },
  { calories: 1400, isToday: false, label: 'THU' },
  { calories: 1960, isToday: false, label: 'FRI' },
  { calories: 2250, isToday: false, label: 'SAT' },
  { calories: 1720, isToday: true,  label: 'SUN' },
];
const MOCK_BASELINE = 1850;

export default function Waveform({
  days = MOCK_DAYS,
  selectedDay = 6,
  baseline = MOCK_BASELINE,
  onDaySelect,
}: WaveformProps) {
  return (
    <div
      style={{
        width: '100%',
        height: CONTAINER_H,
        position: 'relative',
        display: 'flex',
      }}
    >
      {/* Baseline axis — full width */}
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

      {/* Bar columns */}
      {days.map((day, i) => {
        const isSelected = i === selectedDay;
        const isSurplus = day.calories > baseline;
        const barH = isSurplus
          ? surplusHeight(day.calories, baseline)
          : deficitHeight(day.calories, baseline);
        const barColor = day.isToday
          ? 'var(--wave-today)'
          : isSurplus
          ? 'var(--wave-surplus)'
          : 'var(--wave-deficit)';
        const barOpacity = isSelected ? 1 : 0.75;

        return (
          <div
            key={i}
            onClick={() => onDaySelect?.(i)}
            style={{
              flex: 1,
              position: 'relative',
              cursor: 'pointer',
              height: CONTAINER_H,
            }}
            role="button"
            aria-label={`${day.label} ${day.calories} kcal`}
          >
            {/* Bar */}
            {day.calories > 0 && barH > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: 4,
                  right: 4,
                  ...(isSurplus
                    ? {
                        bottom: CONTAINER_H - BASELINE_Y,
                        height: barH,
                        borderRadius: '2px 2px 0 0',
                      }
                    : {
                        top: BASELINE_Y,
                        height: barH,
                        borderRadius: '0 0 2px 2px',
                      }),
                  background: barColor,
                  opacity: barOpacity,
                  transition: 'opacity 150ms ease',
                  zIndex: 2,
                }}
              />
            )}

            {/* Day label */}
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
                fontWeight: 400,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: day.isToday || isSelected ? 'var(--ink-1)' : 'var(--ink-3)',
              }}
            >
              {day.label.slice(0, 1)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
