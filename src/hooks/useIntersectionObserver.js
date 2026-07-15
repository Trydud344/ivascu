import { useState, useEffect } from 'react';

const OBSERVER_THRESHOLD = 0.1;

export default function useIntersectionObserver(elementRef, shouldObserve = false) {
  const [isVisible, setIsVisible] = useState(!shouldObserve);

  useEffect(() => {
    if (!shouldObserve || !elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: OBSERVER_THRESHOLD }
    );

    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [elementRef, shouldObserve]);

  return isVisible;
}
