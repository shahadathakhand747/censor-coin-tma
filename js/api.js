/* ===== api.js ===== */

/** Verify channel membership */
async function verifyMembership(userId) {
  try {
    const res = await fetch(CONFIG.API_BASE + '/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        channel_username: CONFIG.CHANNEL_ID
      })
    });
    const data = await res.json();
    return data;
  } catch(e) {
    console.warn('verifyMembership error:', e);
    return { error: true, message: e.message };
  }
}

/** Register user with referral */
async function registerUser(telegram_id, username, first_name, referral_code_used) {
  try {
    const res = await fetch(CONFIG.WORKER_BASE + '/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id, username, first_name, referral_code_used })
    });
    const data = await res.json();
    return data;
  } catch(e) {
    console.warn('registerUser error:', e);
    return { error: true };
  }
}

/** Fetch daily referral count (once per day) */
async function fetchDailyReferralCount(telegram_id) {
  try {
    const res = await fetch(
      CONFIG.WORKER_BASE + '/api/daily-referral-count?telegram_id=' + encodeURIComponent(telegram_id)
    );
    const data = await res.json();
    return data;
  } catch(e) {
    console.warn('fetchDailyReferralCount error:', e);
    return { count: 0, error: true };
  }
}
