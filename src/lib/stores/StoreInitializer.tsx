'use client';

import { useEffect } from 'react';
import { useAppStore } from './appStore';

/**
 * Component to initialize the store on the client side.
 * Handles CSS variable updates and theme application.
 */
export function StoreInitializer() {
  // Use separate selectors to avoid recreating objects
  const themeId = useAppStore((state) => state.themeId);
  const healthGlow = useAppStore((state) => state.healthGlow);

  // Update CSS variable when health glow changes
  useEffect(() => {
    const getHealthGlowColor = (status: typeof healthGlow): string => {
      switch (status) {
        case 'excellent':
          return 'rgba(34, 197, 94, 0.15)'; // green
        case 'good':
          return 'rgba(234, 179, 8, 0.15)'; // yellow
        case 'poor':
          return 'rgba(239, 68, 68, 0.15)'; // red
        default:
          return 'transparent';
      }
    };

    document.documentElement.style.setProperty('--health-glow-color', getHealthGlowColor(healthGlow));
  }, [healthGlow]);

  // Apply data-theme attribute to root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
  }, [themeId]);

  // This component doesn't render anything
  return null;
}
