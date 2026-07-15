import { useState, useEffect } from 'react';

const DEBOUNCE_DELAY_MS = 100;
const MOBILE_BREAKPOINT = 480;
const TABLET_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;

function debounce(callback, wait) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => callback(...args), wait);
  };
}

function getResponsiveKeyName(key, prefix) {
  const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
  return `${prefix}${capitalizedKey}`;
}

export default function useResponsiveDimension(responsive, config, key) {
  const [value, setValue] = useState(config[key]);

  useEffect(() => {
    if (!responsive) return;

    const calculateDimension = () => {
      const width = window.innerWidth;
      let targetValue = config[key];

      const mobileKey = getResponsiveKeyName(key, 'mobile');
      const tabletKey = getResponsiveKeyName(key, 'tablet');
      const desktopKey = getResponsiveKeyName(key, 'desktop');

      if (width <= MOBILE_BREAKPOINT && config[mobileKey]) {
        targetValue = config[mobileKey];
      } else if (width <= TABLET_BREAKPOINT && config[tabletKey]) {
        targetValue = config[tabletKey];
      } else if (width <= DESKTOP_BREAKPOINT && config[desktopKey]) {
        targetValue = config[desktopKey];
      }

      setValue(targetValue);
    };

    const debouncedCalculate = debounce(calculateDimension, DEBOUNCE_DELAY_MS);
    calculateDimension();

    window.addEventListener('resize', debouncedCalculate);
    return () => window.removeEventListener('resize', debouncedCalculate);
  }, [responsive, config, key]);

  return responsive ? value : config[key];
}
