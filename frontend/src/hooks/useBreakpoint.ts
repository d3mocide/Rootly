import { useState, useEffect } from 'react';

export function useBreakpoint(breakpoint = 700) {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= breakpoint);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);

  return isDesktop;
}
