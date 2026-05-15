import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { AUTH_URL } from '../api/client';
import type { AuthUser } from '../lib/auth';

interface Props {
  onLogin: (token: string, user: AuthUser) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCredential(credential: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${AUTH_URL}/google`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ credential }),
      });
      if (!res.ok) throw new Error('Authentication failed');
      const { token, user } = await res.json();
      onLogin(token, user);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center max-w-lg mx-auto px-6"
      style={{ background: 'var(--bg-0)', color: 'var(--ink-0)' }}
    >
      <div className="mb-12 text-center">
        <h1 className="font-display font-extrabold text-4xl tracking-tight mb-1.5" style={{ color: 'var(--gold)' }}>
          NOURIQ
        </h1>
        <p className="text-label opacity-25 tracking-[0.3em]">NUTRITION INTELLIGENCE</p>
      </div>

      <div
        className="w-full rounded-2xl p-8"
        style={{ background: 'var(--bg-1)', border: '1px solid var(--ink-4)' }}
      >
        <div className="mb-7 text-center">
          <p className="text-body" style={{ color: 'var(--ink-2)', lineHeight: '1.7' }}>
            Track what you eat.<br />
            Understand your pattern.
          </p>
        </div>

        <div className="flex justify-center">
          {loading ? (
            <div className="flex items-center gap-2 text-label py-2" style={{ color: 'var(--ink-3)' }}>
              <span
                className="inline-block w-3.5 h-3.5 rounded-full border animate-spin"
                style={{ borderColor: 'var(--ink-4)', borderTopColor: 'var(--ink-2)' }}
              />
              SIGNING IN...
            </div>
          ) : (
            <GoogleLogin
              theme="filled_black"
              size="large"
              shape="rectangular"
              text="signin_with"
              onSuccess={res => { if (res.credential) handleCredential(res.credential); }}
              onError={(err) => { console.error('GoogleLogin error:', err); setError('Google sign-in failed'); }}
            />
          )}
        </div>

        {error && (
          <p className="mt-4 text-center text-label" style={{ color: 'var(--status-down)' }}>
            {error}
          </p>
        )}
      </div>

      <p className="mt-8 text-micro text-center" style={{ color: 'var(--ink-3)', letterSpacing: '0.2em' }}>
        YOUR DATA IS PRIVATE AND TIED TO YOUR GOOGLE ACCOUNT
      </p>
    </div>
  );
}
