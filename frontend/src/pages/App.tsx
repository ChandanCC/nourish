import { useState, useRef } from 'react';
import { useDay, useAddEntry, useDeleteEntry } from '../hooks/useLogs';
import { useAuth } from '../hooks/useAuth';
import { getTodayKey, detectDateFromText, analyseFood } from '../lib/nutrition';
import HomeScreen from '../components/HomeScreen';
import TodayZone from '../components/TodayZone';
import LogZone from '../components/LogZone';
import LoginPage from './LoginPage';

export default function App() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const [activeDay, setActiveDay] = useState(getTodayKey());
  const [input, setInput]         = useState('');
  const [analysing, setAnalysing] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: dayData, isLoading: dayLoading } = useDay(activeDay);
  const addEntry    = useAddEntry(activeDay);
  const deleteEntry = useDeleteEntry(activeDay);

  const entries = dayData?.entries || [];

  async function handleLog() {
    if (!input.trim() || analysing) return;
    setAnalysing(true);
    setError(null);
    try {
      const parsed    = await analyseFood(input);
      const targetDay = detectDateFromText(input);
      await addEntry.mutateAsync({
        rawText: input,
        summary: parsed.summary || '',
        items:   parsed.items   || [],
        totals:  parsed.totals  || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        micros:  parsed.micros  || {},
      });
      setActiveDay(targetDay);
      setInput('');
      textareaRef.current?.focus();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setAnalysing(false);
    }
  }

  async function handleDelete(entryId: string) {
    setDeletingId(entryId);
    try { await deleteEntry.mutateAsync(entryId); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Delete failed'); }
    finally { setDeletingId(null); }
  }

  if (!isAuthenticated) return <LoginPage onLogin={login} />;

  return (
    <HomeScreen
      user={user}
      onLogout={logout}
      input={input}
      setInput={setInput}
      analysing={analysing}
      onLog={handleLog}
      error={error}
      onClearError={() => setError(null)}
      textareaRef={textareaRef}
    >
      <TodayZone />

      <LogZone
        entries={entries}
        isLoading={dayLoading}
        activeDay={activeDay}
        deletingId={deletingId}
        onDelete={handleDelete}
      />
    </HomeScreen>
  );
}
