import type { ReactNode } from 'react';

interface TodayZoneProps {
  children?: ReactNode;
}

export default function TodayZone({ children }: TodayZoneProps) {
  return (
    <div className="today-zone">
      {children}
    </div>
  );
}
