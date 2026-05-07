import { useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import type { AuthUser } from '../lib/auth';
import SignalZone from './SignalZone';

interface HomeScreenProps {
  user: AuthUser | null;
  onLogout: () => void;
  input: string;
  setInput: (v: string) => void;
  analysing: boolean;
  onLog: () => void;
  error: string | null;
  onClearError: () => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  children: ReactNode;
}

export default function HomeScreen({
  user,
  onLogout,
  input,
  setInput,
  analysing,
  onLog,
  error,
  onClearError,
  textareaRef,
  children,
}: HomeScreenProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <>
      {/* Scrim — dims content when command bar is focused */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          bottom: 56,
          background: 'rgba(8,8,13,0.60)',
          pointerEvents: 'none',
          zIndex: 9,
          opacity: isFocused ? 1 : 0,
          transition: 'opacity 150ms linear',
        }}
      />

      {/* Gradient fade — always visible above command bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 56,
          left: 0,
          right: 0,
          height: 40,
          background: 'linear-gradient(to bottom, transparent, var(--bg-0))',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      <div
        className="max-w-lg mx-auto"
        style={{ minHeight: '100vh', paddingBottom: '88px', color: 'var(--ink-0)' }}
      >
        <SignalZone user={user} onLogout={onLogout} />
        {children}
      </div>

      {/* Command bar — fixed to bottom, respects max-w-lg centering */}
      <div
        className="fixed bottom-0 w-full max-w-lg"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-0)',
          borderTop: isFocused
            ? '1px solid rgba(237,184,74,0.25)'
            : '1px solid var(--ink-4)',
          transition: 'border-top-color 150ms linear',
          zIndex: 10,
        }}
      >
        {error && (
          <div
            className="mx-5 mt-2 px-3 py-2 rounded-lg text-[10px] leading-relaxed break-words"
            style={{
              background: 'rgba(232,84,84,0.07)',
              border: '1px solid rgba(232,84,84,0.20)',
              color: 'var(--status-down)',
            }}
          >
            <strong>Error:</strong> {error}
            <span className="ml-2 cursor-pointer opacity-50" onClick={onClearError}>✕</span>
          </div>
        )}
        <div className="px-5 pb-6 pt-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onLog(); }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={'What did you eat?\n\n"2 eggs, banana, oats for breakfast"\n"yesterday dinner: dal rice sabzi roti"'}
            rows={3}
            className="w-full rounded-xl px-3.5 py-3 text-[12px] leading-relaxed outline-none transition-colors duration-200"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--ink-4)',
              color: 'var(--ink-0)',
              resize: 'none',
            }}
          />
          <div className="flex justify-between items-center mt-2.5">
            <span className="text-[9px] opacity-20 tracking-wide">⌘↩ to log</span>
            <button
              onClick={onLog}
              disabled={analysing || !input.trim()}
              className="font-display font-extrabold text-[13px] tracking-widest rounded-xl px-6 py-3 transition-all duration-200 hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--gold)', color: 'var(--bg-0)' }}
            >
              {analysing ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-black/20 border-t-bg-0 animate-spin" />
                  Analysing...
                </span>
              ) : 'LOG IT'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
