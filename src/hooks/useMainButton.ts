import { useEffect } from 'react';
import { useTelegram } from './useTelegram';

export function useMainButton(text: string, onClick: () => void, show = true) {
  const { webApp } = useTelegram();

  useEffect(() => {
    if (!webApp?.MainButton) return;

    const btn = webApp.MainButton;
    btn.setText(text);
    btn.onClick(onClick);

    if (show) {
      btn.show();
    } else {
      btn.hide();
    }

    return () => {
      btn.offClick(onClick);
      btn.hide();
    };
  }, [webApp, text, onClick, show]);
}
