import { useMemo } from 'react';
import { useTelegram } from './useTelegram';

export function useLaunchParams() {
  const { user, startParam } = useTelegram();

  return useMemo(() => ({
    initData: window.Telegram?.WebApp?.initData ?? '',
    user,
    startParam,
  }), [user, startParam]);
}
