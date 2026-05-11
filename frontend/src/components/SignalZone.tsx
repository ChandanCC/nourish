import { useState, useEffect } from 'react';
import type { HomeWaveformDay } from '../types';
import SignalHero from './SignalHero';

interface WaveformBarDay {
  calories: number;
  isToday: boolean;
  label: string;
}

function buildWaveformDays(data: HomeWaveformDay[]): WaveformBarDay[] {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const result: WaveformBarDay[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const found = data.find(x => x.date === dateStr);
    const label = new Date(dateStr + 'T12:00:00')
      .toLocaleDateString('en-US', { weekday: 'short' })
      .toUpperCase()
      .slice(0, 3);
    result.push({
      calories: found?.calories ?? 0,
      isToday: dateStr === todayStr,
      label,
    });
  }

  return result;
}

interface SignalZoneProps {
  state: string;
  subtitle: string | null;
  delta: string | null;
  aiInstruction: string | null;
  waveformDays: HomeWaveformDay[];
  selectedDayIndex: number;
  baseline: number;
  onDaySelect: (index: number) => void;
}

export default function SignalZone({
  state, subtitle, delta,
  waveformDays, selectedDayIndex, baseline, onDaySelect,
}: SignalZoneProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  const barDays = buildWaveformDays(waveformDays);

  return (
    <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 400ms linear' }}>
      <SignalHero
        state={state}
        subtitle={subtitle}
        delta={delta}
        waveformDays={barDays}
        selectedDay={selectedDayIndex}
        baseline={baseline}
        onDaySelect={onDaySelect}
      />
    </div>
  );
}
