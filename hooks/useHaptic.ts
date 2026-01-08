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
    vibrate([50, 30, 50]);
  }, [vibrate]);

  const triggerError = useCallback(() => {
    vibrate([100, 50, 100]);
  }, [vibrate]);

  return { vibrate, triggerSuccess, triggerError };
};
