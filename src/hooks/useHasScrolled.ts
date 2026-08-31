import { useEffect, useState } from 'react';

/** Reports whether the page has scrolled past `threshold` pixels. */
export function useHasScrolled(threshold = 24): boolean {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const update = () => setHasScrolled(window.scrollY > threshold);

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [threshold]);

  return hasScrolled;
}
