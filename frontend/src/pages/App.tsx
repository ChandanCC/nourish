import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useHomeScreen, useLogEntry, useDeleteEntry } from '../hooks/useHomeScreen';
import { getTodayKey, analyseFood } from '../lib/nutrition';
import HomeScreen from '../components/HomeScreen';
import SignalZone from '../components/SignalZone';
import TodayZone from '../components/TodayZone';
import LogZone from '../components/LogZone';
import SignalExplanation from '../components/SignalExplanation';
import ErrorBoundary from '../components/ErrorBoundary';
import LoginPage from './LoginPage';
import WelcomeScreen from './onboarding/WelcomeScreen';
import GoalSelectionScreen from './onboarding/GoalSelectionScreen';
import ProteinTargetScreen from './onboarding/ProteinTargetScreen';
import type { UserGoal } from '../types';

type OnboardingStep = 'welcome' | 'goal' | 'protein';

const SIGNAL_EXPLAINED_KEY = 'nouriq_signal_explained';

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export default function App() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const [input, setInput]         = useState('');
  const [analysing, setAnalysing] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('welcome');
  const [selectedGoal, setSelectedGoal]     = useState<UserGoal | null>(null);

  // First-time SIGNAL explanation
  const [showExplanation, setShowExplanation] = useState(false);
  const signalTriggerFired = useRef(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: homeData } = useHomeScreen();
  const logEntryMutation   = useLogEntry();
  const deleteEntryMutation = useDeleteEntry();

  const today = getTodayKey();

  const waveformDays = homeData?.waveform ?? [];
  const effectiveIndex = selectedDayIndex ?? (waveformDays.length > 0 ? waveformDays.length - 1 : 0);

  // Show first-time SIGNAL explanation once per device after onboarding
  useEffect(() => {
    if (!homeData?.onboardingComplete) return;
    if (localStorage.getItem(SIGNAL_EXPLAINED_KEY) === 'true') return;
    setShowExplanation(true);
  }, [homeData?.onboardingComplete]);

  // Trigger first SIGNAL computation once after onboarding
  useEffect(() => {
    if (!homeData?.onboardingComplete) return;
    if (signalTriggerFired.current) return;
    signalTriggerFired.current = true;
    fetch('/api/signal/recompute', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('nouriq_token')}` },
    }).catch(() => { /* non-critical */ });
  }, [homeData?.onboardingComplete]);

  function handleDismissExplanation() {
    localStorage.setItem(SIGNAL_EXPLAINED_KEY, 'true');
    setShowExplanation(false);
  }

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
        parsedByModel: parsed.parsedByModel,
        idempotencyKey: uuidv4(),
      });
      setInput('');
      setSelectedDayIndex(null);
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

  // Onboarding gate: homeData loaded and not complete
  if (homeData && !homeData.onboardingComplete) {
    if (onboardingStep === 'welcome') {
      return <WelcomeScreen onContinue={() => setOnboardingStep('goal')} />;
    }
    if (onboardingStep === 'goal') {
      return (
        <GoalSelectionScreen
          onContinue={goal => { setSelectedGoal(goal); setOnboardingStep('protein'); }}
        />
      );
    }
    if (onboardingStep === 'protein' && selectedGoal) {
      return (
        <ProteinTargetScreen
          goal={selectedGoal}
          onComplete={() => { /* homeData refetch via invalidateQueries in ProteinTargetScreen */ }}
        />
      );
    }
  }

  const signal = homeData?.signal;
  const todayData = homeData?.today;
  const entries = homeData?.entries ?? [];

  return (
    <>
      <HomeScreen
        input={input}
        setInput={setInput}
        analysing={analysing}
        onLog={handleLog}
        error={error}
        onClearError={() => setError(null)}
        textareaRef={textareaRef}
      >
        <ErrorBoundary>
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
        </ErrorBoundary>

        <ErrorBoundary>
          <TodayZone
            protein={todayData?.protein ?? 0}
            proteinTarget={todayData?.targets.protein ?? 160}
            aiInstruction={signal?.aiInstruction ?? null}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <LogZone
            entries={entries}
            isLoading={false}
            activeDay={today}
            deletingId={deletingId}
            onDelete={handleDelete}
          />
        </ErrorBoundary>
      </HomeScreen>

      {showExplanation && <SignalExplanation onDismiss={handleDismissExplanation} />}
    </>
  );
}
