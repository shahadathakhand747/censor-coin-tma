import { useEffect, useRef } from 'react';

interface AdComponentProps {
  onReward?: () => void;
  onError?: (err: unknown) => void;
  children?: React.ReactNode;
}

export default function OnClickAComponent({ onReward, onError, children }: AdComponentProps) {
  const showAd = useRef<(() => Promise<void>) | undefined>(undefined);
  const spotId = parseInt(import.meta.env.VITE_ONCLICKA_SPOT_ID ?? '6116695');

  useEffect(() => {
    window.initCdTma?.({ id: spotId })
      .then((show) => { showAd.current = show; })
      .catch((e) => console.log('OnClickA init error:', e));
  }, [spotId]);

  const handleClick = () => {
    if (showAd.current) {
      showAd.current()
        .then(() => onReward?.())
        .catch((err) => onError?.(err));
    } else {
      // Fallback: reward directly if ad not available (dev mode)
      setTimeout(() => onReward?.(), 1000);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full"
    >
      {children}
    </button>
  );
}
