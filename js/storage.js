/* ===== storage.js ===== */

const DEFAULT_STATE = {
  membership_verified: false,
  reg_status: 'unregistered',
  referral_code: '',
  username: '',
  first_name: '',
  profile_photo_url: null,
  total_points: 0,
  total_refers: 0,
  today_tasks_completed: 0,
  claim_codes_used: [],
  youtube_completed: false,
  tiktok_completed: false,
  facebook_completed: false,
  last_referral_check_date: '',
  ton_address: '',
  last_ton_address_change: '',
  language: 'en',
  schema_version: 1
};

// Global mutable state
let appState = Object.assign({}, DEFAULT_STATE);

const STORAGE_KEY = 'censor_coin_state';
const MAX_BYTES = 4096;

const storage = {
  async load() {
    try {
      // Try Telegram CloudStorage first
      const tg = window.Telegram && window.Telegram.WebApp;
      if (tg && tg.CloudStorage) {
        return new Promise((resolve) => {
          tg.CloudStorage.getItem(STORAGE_KEY, (err, val) => {
            if (!err && val) {
              try {
                const parsed = JSON.parse(val);
                appState = Object.assign({}, DEFAULT_STATE, parsed);
                // Reset task/claim state daily
                resetDailyStateIfNeeded();
                resolve(appState);
                return;
              } catch(e) {}
            }
            appState = Object.assign({}, DEFAULT_STATE);
            resolve(appState);
          });
        });
      }
    } catch(e) {}

    // Fallback: localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        appState = Object.assign({}, DEFAULT_STATE, parsed);
        resetDailyStateIfNeeded();
        return appState;
      }
    } catch(e) {}

    appState = Object.assign({}, DEFAULT_STATE);
    return appState;
  },

  async save(state) {
    const json = JSON.stringify(state);
    if (json.length > MAX_BYTES) {
      console.warn('State exceeds 4096 bytes, trimming claim_codes_used');
      // Trim oldest codes to reduce size
      if (state.claim_codes_used && state.claim_codes_used.length > 7) {
        state.claim_codes_used = state.claim_codes_used.slice(-7);
      }
    }
    const finalJson = JSON.stringify(state);

    try {
      const tg = window.Telegram && window.Telegram.WebApp;
      if (tg && tg.CloudStorage) {
        tg.CloudStorage.setItem(STORAGE_KEY, finalJson, () => {});
      }
    } catch(e) {}

    // Also save to localStorage as backup
    try {
      localStorage.setItem(STORAGE_KEY, finalJson);
    } catch(e) {}

    appState = state;
    return true;
  }
};

/** Reset per-day counters if date changed */
function resetDailyStateIfNeeded() {
  const today = getTodayBD();
  if (!appState._last_day || appState._last_day !== today) {
    appState.today_tasks_completed = 0;
    appState.claim_codes_used = [];
    appState.youtube_completed = false;
    appState.tiktok_completed = false;
    appState.facebook_completed = false;
    appState._last_day = today;
  }
}
