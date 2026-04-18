import { useRef, useCallback } from 'react';
import createAdHandler from 'monetag-tg-sdk';

const zoneId = parseInt(import.meta.env.VITE_MONETAG_ZONE_ID ?? '10883491');
const adHandler = createAdHandler(zoneId);

interface MonetagAdProps {
  type?: 'pop' | 'interstitial';
  onComplete: () => void;
  onError?: (err: unknown) => void;
}

export function useMonetagAd() {
  const runningRef = useRef(false);

  const showAd = useCallback(async (type: 'pop' | 'interstitial' = 'interstitial'): Promise<void> => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      if (type === 'pop') {
        await adHandler('pop');
      } else {
        await adHandler();
      }
    } catch (e) {
      console.log('Monetag ad error:', e);
    } finally {
      runningRef.current = false;
    }
  }, []);

  return { showAd };
}

export default function MonetagAd({ type = 'interstitial', onComplete, onError }: MonetagAdProps) {
  const { showAd } = useMonetagAd();

  const handleShow = async () => {
    try {
      await showAd(type);
      onComplete();
    } catch (e) {
      onError?.(e);
      // Fallback to rewarding even if ad fails
      onComplete();
    }
  };

  return { handleShow };
}
