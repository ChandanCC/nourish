import type { ReactNode } from 'react';

interface LogZoneProps {
  children?: ReactNode;
}

export default function LogZone({ children }: LogZoneProps) {
  return (
    <div className="log-zone">
      {children}
    </div>
  );
}
