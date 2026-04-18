import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { CensorCoinUserState, DEFAULT_USER_STATE } from '../types';
import { useCloudStorage } from '../hooks/useCloudStorage';
import { useTelegram } from '../hooks/useTelegram';
import { getTodayDhaka } from '../utils/date';
import { generateReferralCode } from '../utils/referralCode';
import i18n from '../i18n';

const STORAGE_KEY = 'censorCoinUser_v1';

interface UserContextType {
  state: CensorCoinUserState | null;
  loading: boolean;
  updateState: (partial: Partial<CensorCoinUserState>) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { getItem, setItem } = useCloudStorage();
  const { user } = useTelegram();
  const [state, setState] = useState<CensorCoinUserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [writePromise, setWritePromise] = useState<Promise<boolean>>(Promise.resolve(true));

  const persistState = useCallback(async (newState: CensorCoinUserState) => {
    const json = JSON.stringify(newState);
    let toSave = newState;
    if (json.length > 4096) {
      toSave = { ...newState, claim_codes_used: newState.claim_codes_used.slice(-15) };
    }
    const next = writePromise.then(() => setItem(STORAGE_KEY, JSON.stringify(toSave)));
    setWritePromise(next);
    await next;
  }, [setItem, writePromise]);

  useEffect(() => {
    let cancelled = false;
    getItem(STORAGE_KEY).then((raw) => {
      if (cancelled) return;
      const today = getTodayDhaka();
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as CensorCoinUserState;
          // Reset daily data if date changed
          let updated = { ...parsed };
          if (parsed.last_referral_check_date && parsed.last_referral_check_date !== today) {
            updated = { ...updated, today_tasks_completed: 0, claim_codes_used: [] };
          }
          // Sync user info from Telegram
          if (user) {
            updated.username = user.username ?? updated.username;
            updated.first_name = user.first_name ?? updated.first_name;
            updated.profile_photo_url = user.photo_url ?? updated.profile_photo_url;
            if (!updated.referral_code && user.id) {
              updated.referral_code = generateReferralCode(user.id);
            }
          }
          if (updated.language) {
            i18n.changeLanguage(updated.language);
          }
          setState(updated);
        } catch {
          setState({ ...DEFAULT_USER_STATE });
        }
      } else {
        const fresh = { ...DEFAULT_USER_STATE };
        if (user) {
          fresh.username = user.username ?? '';
          fresh.first_name = user.first_name ?? '';
          fresh.profile_photo_url = user.photo_url ?? null;
          fresh.referral_code = generateReferralCode(user.id);
        }
        setState(fresh);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateState = useCallback(async (partial: Partial<CensorCoinUserState>): Promise<void> => {
    setState((prev) => {
      const next = { ...(prev ?? DEFAULT_USER_STATE), ...partial };
      persistState(next);
      return next;
    });
  }, [persistState]);

  return (
    <UserContext.Provider value={{ state, loading, updateState }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
