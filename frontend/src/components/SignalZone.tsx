import { useState, useRef, useEffect } from 'react';
import type { AuthUser } from '../lib/auth';
import SignalHero from './SignalHero';

interface SignalZoneProps {
  user: AuthUser | null;
  onLogout: () => void;
}

export default function SignalZone({ user, onLogout }: SignalZoneProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsCollapsed(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-44px 0px 0px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Collapsed strip (sticky) — rendered outside the hero so it doesn't scroll away */}
      {isCollapsed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: '100%', maxWidth: '32rem' }}>
            <SignalHero
              state="READING"
              subtitle="Day 3 · Baseline forming"
              delta={null}
              isCollapsed={true}
              user={user}
              onLogout={onLogout}
            />
          </div>
        </div>
      )}

      {/* Full hero */}
      <SignalHero
        state="READING"
        subtitle="Day 3 · Baseline forming"
        delta={null}
        isCollapsed={false}
        user={user}
        onLogout={onLogout}
      />

      {/* Sentinel: when this leaves the viewport, collapse triggers */}
      <div ref={sentinelRef} style={{ height: 0 }} />
    </>
  );
}
