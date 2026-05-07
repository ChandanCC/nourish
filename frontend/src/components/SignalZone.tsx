import type { AuthUser } from '../lib/auth';
import SignalHero from './SignalHero';

interface SignalZoneProps {
  user: AuthUser | null;
  onLogout: () => void;
}

export default function SignalZone({ user, onLogout }: SignalZoneProps) {
  // isCollapsed scroll trigger added in P02-004
  return (
    <SignalHero
      state="READING"
      subtitle="Day 3 · Baseline forming"
      delta={null}
      isCollapsed={false}
      user={user}
      onLogout={onLogout}
    />
  );
}
