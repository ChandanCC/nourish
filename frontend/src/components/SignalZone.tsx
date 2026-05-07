import type { AuthUser } from '../lib/auth';

interface SignalZoneProps {
  user: AuthUser | null;
  onLogout: () => void;
}

export default function SignalZone({ user, onLogout }: SignalZoneProps) {
  return (
    <div
      style={{ minHeight: '48vh', position: 'relative', borderBottom: '1px solid var(--ink-4)' }}
    >
      <div style={{ position: 'absolute', top: '16px', right: '20px' }}>
        <button onClick={onLogout} title={`Sign out (${user?.email ?? ''})`}>
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name ?? ''}
              className="w-6 h-6 rounded-full opacity-70"
            />
          ) : (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: 'var(--gold-3)', color: 'var(--gold)' }}
            >
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
