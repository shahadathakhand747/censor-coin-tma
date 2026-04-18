import { useTelegram } from './useTelegram';
import { useCallback } from 'react';

export function useCloudStorage() {
  const { webApp } = useTelegram();

  const getItem = useCallback((key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!webApp?.CloudStorage) {
        const val = localStorage.getItem(key);
        resolve(val);
        return;
      }
      webApp.CloudStorage.getItem(key, (err, value) => {
        if (err) {
          resolve(null);
          return;
        }
        resolve(value ?? null);
      });
    });
  }, [webApp]);

  const setItem = useCallback((key: string, value: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (JSON.stringify(value).length > 4096) {
        console.error('CloudStorage: value exceeds 4KB limit');
        resolve(false);
        return;
      }
      if (!webApp?.CloudStorage) {
        localStorage.setItem(key, value);
        resolve(true);
        return;
      }
      webApp.CloudStorage.setItem(key, value, (err) => {
        resolve(!err);
      });
    });
  }, [webApp]);

  const removeItem = useCallback((key: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!webApp?.CloudStorage) {
        localStorage.removeItem(key);
        resolve(true);
        return;
      }
      webApp.CloudStorage.removeItem(key, (err) => {
        resolve(!err);
      });
    });
  }, [webApp]);

  return { getItem, setItem, removeItem };
}
