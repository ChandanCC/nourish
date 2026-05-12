import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useHomeScreen, useHomeForDate, useLogEntry, useDeleteEntry, useEditEntry, useLogTraining, useDeleteTraining } from '../hooks/useHomeScreen';
import { getTodayKey, analyseFood } from '../lib/nutrition';
import type { EditEntryPayload } from '../api/client';
import HomeScreen from '../components/HomeScreen';
import SignalZone from '../components/SignalZone';
import NutritionCard from '../components/NutritionCard';
import TrainingCard from '../components/TrainingCard';
import NutritionDetailScreen from '../components/NutritionDetailScreen';
import TrainingDetailScreen from '../components/TrainingDetailScreen';
import TrainingLogScreen from '../components/TrainingLogScreen';
import SignalExplanation from '../components/SignalExplanation';
import ErrorBoundary from '../components/ErrorBoundary';
import LoginPage from './LoginPage';
import WelcomeScreen from './onboarding/WelcomeScreen';
import GoalSelectionScreen from './onboarding/GoalSelectionScreen';
import WeightScreen from './onboarding/WeightScreen';
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
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [deletingTrainingId, setDeletingTrainingId] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const [showNutritionDetail, setShowNutritionDetail] = useState(false);
  const [showTrainingDetail, setShowTrainingDetail]   = useState(false);
  const [showTrainingLog, setShowTrainingLog]         = useState(false);

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('welcome');
  const [selectedGoal, setSelectedGoal]     = useState<UserGoal | null>(null);

  // First-time SIGNAL explanation
  const [showExplanation, setShowExplanation] = useState(false);
  const signalTriggerFired = useRef(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: homeData } = useHomeScreen();
  const logEntryMutation      = useLogEntry();
  const deleteEntryMutation   = useDeleteEntry();
  const editEntryMutation     = useEditEntry();
  const logTrainingMutation   = useLogTraining();
  const deleteTrainingMutation = useDeleteTraining();

  const today = getTodayKey();

  const waveformDays = homeData?.waveform ?? [];
  const effectiveIndex = selectedDayIndex ?? 6;

  const isViewingToday = effectiveIndex === 6;
  const selectedDate = (() => {
    if (isViewingToday) return null;
    const d = new Date();
    d.setDate(d.getDate() - (6 - effectiveIndex));
    return d.toISOString().split('T')[0];
  })();

  const { data: pastDayData } = useHomeForDate(selectedDate);

  const activeData = isViewingToday ? homeData : (pastDayData ?? homeData);

  useEffect(() => {
    if (!homeData?.onboardingComplete) return;
    if (localStorage.getItem(SIGNAL_EXPLAINED_KEY) === 'true') return;
    setShowExplanation(true);
  }, [homeData?.onboardingComplete]);

  useEffect(() => {
    if (!homeData?.onboardingComplete) return;
    if (signalTriggerFired.current) return;
    signalTriggerFired.current = true;
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    fetch(`${apiBase}/signal/recompute`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('nourish_token')}` },
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
        confidence: parsed.confidence,
        sourceType: parsed.sourceType,
        sourceId: parsed.sourceId,
        ironMg:        parsed.ironMg,
        calciumMg:     parsed.calciumMg,
        vitaminDMcg:   parsed.vitaminDMcg,
        vitaminB12Mcg: parsed.vitaminB12Mcg,
        magnesiumMg:   parsed.magnesiumMg,
        zincMg:        parsed.zincMg,
        potassiumMg:   parsed.potassiumMg,
        sodiumMg:      parsed.sodiumMg,
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

  async function handleEdit(entryId: string, payload: EditEntryPayload) {
    setEditingId(entryId);
    try { await editEntryMutation.mutateAsync({ id: entryId, payload }); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Edit failed'); }
    finally { setEditingId(null); }
  }

  async function handleDeleteTraining(sessionId: string) {
    setDeletingTrainingId(sessionId);
    try { await deleteTrainingMutation.mutateAsync(sessionId); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Delete failed'); }
    finally { setDeletingTrainingId(null); }
  }

  if (!isAuthenticated) return <LoginPage onLogin={login} />;

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
        <WeightScreen
          goal={selectedGoal}
          onComplete={() => { /* homeData refetch via invalidateQueries in WeightScreen */ }}
        />
      );
    }
  }

  const signal = homeData?.signal;
  const todayData = activeData?.today;
  const entries = activeData?.entries ?? [];
  const training = activeData?.training ?? null;

  return (
    <>
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
        onOpenTraining={() => setShowTrainingLog(true)}
      >
        <ErrorBoundary>
          <SignalZone
            state={signal?.state ?? 'READING'}
            subtitle={signal?.subtitle ?? null}
            delta={signal?.delta ?? null}
            aiInstruction={signal?.aiInstruction ?? null}
            waveformDays={waveformDays}
            selectedDayIndex={effectiveIndex}
            baseline={todayData?.targets?.calories ?? 1850}
            onDaySelect={setSelectedDayIndex}
          />
        </ErrorBoundary>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 16 }}>
          <ErrorBoundary>
            <NutritionCard
              date={todayData?.date ?? today}
              calories={todayData?.calories ?? 0}
              protein={todayData?.protein ?? 0}
              carbs={todayData?.carbs ?? 0}
              fat={todayData?.fat ?? 0}
              fiber={todayData?.fiber ?? 0}
              targets={todayData?.targets ?? { calories: 2000, protein: 160, carbs: 200, fat: 65, fiber: 30 }}
              onOpen={() => setShowNutritionDetail(true)}
            />
          </ErrorBoundary>

          <ErrorBoundary>
            <TrainingCard
              training={training}
              onOpen={() => setShowTrainingDetail(true)}
            />
          </ErrorBoundary>
        </div>
      </HomeScreen>

      {showExplanation && <SignalExplanation onDismiss={handleDismissExplanation} />}

      {showNutritionDetail && (
        <NutritionDetailScreen
          date={todayData?.date ?? today}
          calories={todayData?.calories ?? 0}
          protein={todayData?.protein ?? 0}
          carbs={todayData?.carbs ?? 0}
          fat={todayData?.fat ?? 0}
          fiber={todayData?.fiber ?? 0}
          targets={todayData?.targets ?? { calories: 2000, protein: 160, carbs: 200, fat: 65, fiber: 30 }}
          micros={todayData?.micros ?? { iron: 0, calcium: 0, vitaminD: 0, vitaminB12: 0, magnesium: 0, zinc: 0, potassium: 0, sodium: 0, isEstimated: false }}
          aiInstruction={signal?.aiInstruction ?? null}
          entries={entries}
          deletingId={deletingId}
          editingId={editingId}
          onDelete={handleDelete}
          onEdit={handleEdit}
          input={input}
          setInput={setInput}
          analysing={analysing}
          onLog={handleLog}
          error={error}
          onClearError={() => setError(null)}
          textareaRef={textareaRef}
          onClose={() => setShowNutritionDetail(false)}
        />
      )}

      {showTrainingDetail && (
        <TrainingDetailScreen
          sessions={training?.sessions ?? []}
          totalCaloriesBurnt={training?.totalCaloriesBurnt ?? 0}
          totalVolumeKg={training?.totalVolumeKg ?? 0}
          deletingId={deletingTrainingId}
          onDelete={handleDeleteTraining}
          onOpenLog={() => setShowTrainingLog(true)}
          onClose={() => setShowTrainingDetail(false)}
        />
      )}

      {showTrainingLog && (
        <TrainingLogScreen
          userWeightKg={homeData?.userWeightKg ?? 70}
          onClose={() => setShowTrainingLog(false)}
          onSubmit={payload => logTrainingMutation.mutateAsync(payload)}
        />
      )}
    </>
  );
}
