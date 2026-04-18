import { useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  language_code?: string;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    start_param?: string;
    hash?: string;
  };
  CloudStorage: {
    getItem: (key: string, callback: (err: Error | null, value?: string) => void) => void;
    setItem: (key: string, value: string, callback?: (err: Error | null, result?: boolean) => void) => void;
    removeItem: (key: string, callback?: (err: Error | null, result?: boolean) => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  themeParams: Record<string, string>;
  colorScheme: 'light' | 'dark';
  version: string;
  platform: string;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  HapticFeedback: {
    impactOccurred: (style: string) => void;
    notificationOccurred: (type: string) => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
    initCdTma?: (options: { id: number }) => Promise<() => Promise<void>>;
  }
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [startParam, setStartParam] = useState<string>('');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      setWebApp(tg);
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }
      if (tg.initDataUnsafe?.start_param) {
        setStartParam(tg.initDataUnsafe.start_param);
      }
    } else {
      // Dev fallback
      setUser({
        id: 123456789,
        username: 'devuser',
        first_name: 'Dev',
        photo_url: undefined,
      });
    }
  }, []);

  return { webApp, user, startParam };
}
