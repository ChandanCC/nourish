import { useState, useRef, useEffect } from 'react';
import type { AuthUser } from '../lib/auth';
import type { HomeWaveformDay } from '../types';
import SignalHero from './SignalHero';

function toWaveformBarDays(days: HomeWaveformDay[]) {
  const today = new Date().toISOString().split('T')[0];
  return days.map(d => ({
    calories: d.calories,
    isToday: d.date === today,
    label: new Date(d.date + 'T12:00:00')
      .toLocaleDateString('en-US', { weekday: 'short' })
      .toUpperCase()
      .slice(0, 3),
  }));
}

interface SignalZoneProps {
  user: AuthUser | null;
  onLogout: () => void;
  state: string;
  subtitle: string | null;
  delta: string | null;
  aiInstruction: string | null;
  waveformDays: HomeWaveformDay[];
  selectedDayIndex: number;
  onDaySelect: (index: number) => void;
}

export default function SignalZone({
  user, onLogout,
  state, subtitle, delta,
  waveformDays, selectedDayIndex, onDaySelect,
}: SignalZoneProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsCollapsed(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-44px 0px 0px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const barDays = toWaveformBarDays(waveformDays);

  return (
    <>
      {/* Collapsed strip (sticky) */}
      {isCollapsed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: '100%', maxWidth: '32rem' }}>
            <SignalHero
              state={state}
              subtitle={subtitle}
              delta={delta}
              isCollapsed={true}
              user={user}
              onLogout={onLogout}
            />
          </div>
        </div>
      )}

      {/* Full hero with live waveform */}
      <SignalHero
        state={state}
        subtitle={subtitle}
        delta={delta}
        isCollapsed={false}
        user={user}
        onLogout={onLogout}
        waveformDays={barDays}
        selectedDay={selectedDayIndex}
        onDaySelect={onDaySelect}
      />

      {/* Sentinel: when this leaves the viewport, collapse triggers */}
      <div ref={sentinelRef} style={{ height: 0 }} />
    </>
  );
}
