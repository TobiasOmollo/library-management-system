import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToHash Component
 * Ensures links like "/#collection" scroll to element after render,
 * and resets scroll to top when there is no hash.
 */
export function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const elementId = hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, hash]);

  return null;
}
