'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ScrollToTop = () => {
  const pathname = usePathname();

  // Disable browser's automatic scroll restoration so our manual scroll works reliably
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      const original = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';

      // Restore the original value on cleanup (e.g., during dev HMR)
      return () => {
        window.history.scrollRestoration = original;
      };
    }
  }, []);

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo(0, 0);
  }, [pathname]);

  // Additional effect to handle page refresh
  useEffect(() => {
    // This effect runs once on component mount (including page refresh)
    const handleLoad = () => {
      window.scrollTo(0, 0);
    };

    // Add event listener for page load/refresh
    window.addEventListener('load', handleLoad);

    // Immediately scroll to top on component mount
    window.scrollTo(0, 0);

    // Cleanup
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return null;
};

export default ScrollToTop;