const MEMBERSHIP_API = 'https://telegram-membership-bot-kwq6.onrender.com/verify';
const REFERRAL_API = 'https://tma-referral-worker.shahadathakhand7.workers.dev/api';

export async function verifyMembership(userId: number): Promise<boolean> {
  try {
    const res = await fetch(MEMBERSHIP_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, channel_username: '-1003925758863' }),
    });
    const data = await res.json();
    return data.is_member === true || data.member === true || data.status === 'member';
  } catch {
    return false;
  }
}

export async function registerUser(params: {
  telegram_id: number;
  username: string;
  first_name: string;
  referral_code_used: string;
}): Promise<{ referral_code?: string; success?: boolean }> {
  try {
    const res = await fetch(`${REFERRAL_API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch {
    return {};
  }
}

export async function getDailyReferralCount(telegramId: number): Promise<number> {
  try {
    const res = await fetch(`${REFERRAL_API}/daily-referral-count?telegram_id=${telegramId}`);
    const data = await res.json();
    return data.count ?? data.total ?? 0;
  } catch {
    return 0;
  }
}
