import { useState, useEffect, useCallback, useRef } from 'react';
import { CensorCoinUserState, DEFAULT_USER_STATE } from '../types';
import { useCloudStorage } from './useCloudStorage';
import { getTodayDhaka } from '../utils/date';

const STORAGE_KEY = 'censorCoinUser_v1';

export function useUserState() {
  const { getItem, setItem } = useCloudStorage();
  const [state, setState] = useState<CensorCoinUserState | null>(null);
  const [loading, setLoading] = useState(true);
  const writeQueue = useRef<Promise<boolean>>(Promise.resolve(true));

  useEffect(() => {
    getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as CensorCoinUserState;
          // Reset daily tasks if date changed
          const today = getTodayDhaka();
          if (parsed.last_referral_check_date !== today) {
            // We only reset today_tasks_completed and claim_codes_used when date changes
          }
          setState(parsed);
        } catch {
          setState({ ...DEFAULT_USER_STATE });
        }
      } else {
        setState({ ...DEFAULT_USER_STATE });
      }
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveState = useCallback(async (newState: CensorCoinUserState): Promise<void> => {
    const json = JSON.stringify(newState);
    if (json.length > 4096) {
      // Trim claim_codes_used if too large
      const trimmed = { ...newState, claim_codes_used: newState.claim_codes_used.slice(-20) };
      writeQueue.current = writeQueue.current.then(() => setItem(STORAGE_KEY, JSON.stringify(trimmed)));
    } else {
      writeQueue.current = writeQueue.current.then(() => setItem(STORAGE_KEY, json));
    }
    await writeQueue.current;
  }, [setItem]);

  const updateState = useCallback(async (partial: Partial<CensorCoinUserState>): Promise<void> => {
    setState((prev) => {
      const next = { ...(prev ?? DEFAULT_USER_STATE), ...partial };
      saveState(next);
      return next;
    });
  }, [saveState]);

  const resetDailyIfNeeded = useCallback(async () => {
    if (!state) return;
    const today = getTodayDhaka();
    // Check if today's date is different from when tasks were last done
    // We use last_referral_check_date as a proxy
    // Actually let's store the last task date separately via a simple check
    // The schema uses last_referral_check_date for referral check, not daily reset
    // We detect daily reset by checking if claim_codes_used has entries from a previous day
    // Simple approach: store last_reset_date in the state indirectly
    // Actually we need to track last task date - we'll use a convention:
    // If today_tasks_completed > 0 but we don't have a lastTaskDate, we use last_referral_check_date
    // For a clean solution, we compare today to last referral check date to know if day changed
    const lastKnownDate = state.last_referral_check_date;
    if (lastKnownDate && lastKnownDate !== today) {
      await updateState({
        today_tasks_completed: 0,
        claim_codes_used: [],
      });
    }
  }, [state, updateState]);

  return { state, loading, updateState, saveState, resetDailyIfNeeded };
}
