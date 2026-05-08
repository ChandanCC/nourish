import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useHomeScreen, useLogEntry, useDeleteEntry } from '../hooks/useHomeScreen';
import { getTodayKey, analyseFood } from '../lib/nutrition';
import HomeScreen from '../components/HomeScreen';
import SignalZone from '../components/SignalZone';
import TodayZone from '../components/TodayZone';
import LogZone from '../components/LogZone';
import LoginPage from './LoginPage';

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export default function App() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const [input, setInput]       = useState('');
  const [analysing, setAnalysing] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: homeData } = useHomeScreen();
  const logEntryMutation  = useLogEntry();
  const deleteEntryMutation = useDeleteEntry();

  const today = getTodayKey();

  // Waveform day selection: null = today, otherwise index into waveform array
  const waveformDays = homeData?.waveform ?? [];
  const effectiveIndex = selectedDayIndex ?? (waveformDays.length > 0 ? waveformDays.length - 1 : 0);

  async function handleLog() {
    if (!input.trim() || analysing) return;
    setAnalysing(true);
    setError(null);
    try {
      const parsed = await analyseFood(input);
      await logEntryMutation.mutateAsync({
        rawInput: input,
        name: parsed.name,
        calories: parsed.calories,
        proteinG: parsed.protein,
        carbsG: parsed.carbs,
        fatG: parsed.fat,
        fiberG: parsed.fiber,
        parseNote: parsed.note ?? null,
        parsedByModel: 'claude-sonnet-4-6',
        idempotencyKey: uuidv4(),
      });
      setInput('');
      setSelectedDayIndex(null); // reset to today after logging
      textareaRef.current?.focus();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setAnalysing(false);
    }
  }

  async function handleDelete(entryId: string) {
    setDeletingId(entryId);
    try { await deleteEntryMutation.mutateAsync(entryId); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Delete failed'); }
    finally { setDeletingId(null); }
  }

  if (!isAuthenticated) return <LoginPage onLogin={login} />;

  const signal = homeData?.signal;
  const todayData = homeData?.today;
  const entries = homeData?.entries ?? [];

  return (
    <HomeScreen
      input={input}
      setInput={setInput}
      analysing={analysing}
      onLog={handleLog}
      error={error}
      onClearError={() => setError(null)}
      textareaRef={textareaRef}
    >
      <SignalZone
        user={user}
        onLogout={logout}
        state={signal?.state ?? 'READING'}
        subtitle={signal?.subtitle ?? null}
        delta={signal?.delta ?? null}
        aiInstruction={signal?.aiInstruction ?? null}
        waveformDays={waveformDays}
        selectedDayIndex={effectiveIndex}
        onDaySelect={setSelectedDayIndex}
      />

      <TodayZone
        protein={todayData?.protein ?? 0}
        proteinTarget={todayData?.targets.protein ?? 160}
        aiInstruction={signal?.aiInstruction ?? null}
      />

      <LogZone
        entries={entries}
        isLoading={false}
        activeDay={today}
        deletingId={deletingId}
        onDelete={handleDelete}
      />
    </HomeScreen>
  );
}
