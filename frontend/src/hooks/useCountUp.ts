import { useState, useEffect, useRef } from 'react';

export function useCountUp(target: number, duration = 320): number {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);
  const displayRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(frameRef.current);
    if (target === displayRef.current) return;

    const startVal = displayRef.current;
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // EASE-DATA approximation: cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startVal + (target - startVal) * eased);
      displayRef.current = current;
      setDisplay(current);
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]); // eslint-disable-line react-hooks/exhaustive-deps

  return display;
}
