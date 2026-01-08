import { useCallback } from 'react';
import { useHapticContext } from '@/contexts/HapticContext';

export const useHaptic = () => {
  const { isEnabled } = useHapticContext();

  const vibrate = useCallback((pattern: number | number[] = 200) => {
    if (isEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, [isEnabled]);

  const triggerSuccess = useCallback(() => {
    // Quick double tap for success
    vibrate([20, 50, 20]);
  }, [vibrate]);

  const triggerError = useCallback(() => {
    // Heavy double vibration for error
    vibrate([200, 100, 200]);
  }, [vibrate]);

  const triggerVictory = useCallback(() => {
    // Celebration pattern
    vibrate([100, 50, 100, 50, 100, 50, 200]);
  }, [vibrate]);

  return { vibrate, triggerSuccess, triggerError, triggerVictory };
};
