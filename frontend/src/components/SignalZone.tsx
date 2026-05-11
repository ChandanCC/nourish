import { useState, useEffect } from 'react';
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
  state: string;
  subtitle: string | null;
  delta: string | null;
  aiInstruction: string | null;
  waveformDays: HomeWaveformDay[];
  selectedDayIndex: number;
  onDaySelect: (index: number) => void;
}

export default function SignalZone({
  state, subtitle, delta,
  waveformDays, selectedDayIndex, onDaySelect,
}: SignalZoneProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  const barDays = toWaveformBarDays(waveformDays);

  return (
    <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 400ms linear' }}>
      <SignalHero
        state={state}
        subtitle={subtitle}
        delta={delta}
        waveformDays={barDays}
        selectedDay={selectedDayIndex}
        onDaySelect={onDaySelect}
      />
    </div>
  );
}
