# Censor Coin TMA

A Telegram Mini App for the Censor Coin project. Earn coins by reviewing content, using claim codes, completing social tasks, and referring friends.

## Features

- **Telegram Membership Verification** — Users must join @censorcoin before access
- **Daily Censoring Tasks** — 6 tasks/day, 5000 coins each with Monetag ads
- **Censor Claim** — 7 claims/day, 3000 coins each with OnClickA rewarded ads
- **Social Tasks** — YouTube & TikTok tasks, 10000 coins each (one-time)
- **Referral System** — 6000 coins per referral, daily count refresh
- **Multi-language** — English, Bengali, Hindi, Spanish
- **TON Wallet** — 14-day cooldown on address changes

## CloudStorage Schema

Key: `censorCoinUser_v1`

```typescript
interface CensorCoinUserState {
  membership_verified: boolean;
  reg_status: 'unregistered' | 'registered';
  referral_code: string;
  username: string;
  first_name: string;
  profile_photo_url: string | null;
  total_points: number;
  total_refers: number;
  today_tasks_completed: number;      // 0-6
  claim_codes_used: string[];         // e.g. ["v1","v3"]
  youtube_task_completed: boolean;
  tiktok_task_completed: boolean;
  last_referral_check_date: string;   // YYYY-MM-DD (Asia/Dhaka)
  ton_address: string;
  last_ton_address_change: string;    // ISO date
  language: 'en' | 'bn' | 'hi' | 'es';
  schema_version: 1;
}
```

**4KB Limit:** JSON.stringify(state).length is checked before every write. If exceeded, `claim_codes_used` is trimmed to the last 15 entries.

**Daily Reset:** `today_tasks_completed` and `claim_codes_used` are reset when the Bangladesh date (Asia/Dhaka) changes.

## API Endpoints

### Verify Membership
```
POST https://telegram-membership-bot-kwq6.onrender.com/verify
Body: { user_id: number, channel_username: "-1003925758863" }
```

### Register User
```
POST https://tma-referral-worker.shahadathakhand7.workers.dev/api/register
Body: { telegram_id, username, first_name, referral_code_used }
```

### Get Daily Referral Count
```
GET https://tma-referral-worker.shahadathakhand7.workers.dev/api/daily-referral-count?telegram_id={id}
```

Referral count is fetched once per day (based on Asia/Dhaka timezone). Each new referral awards 6000 coins.

## Ad Integrations

### Monetag
- Zone ID: `10883491` (via `VITE_MONETAG_ZONE_ID`)
- Package: `monetag-tg-sdk`
- Tasks 1-3: `adHandler('pop')` — Rewarded Pop ad
- Tasks 4-6: `adHandler()` — Rewarded Interstitial ad

### OnClickA
- Spot ID: `6116695` (via `VITE_ONCLICKA_SPOT_ID`)
- Ad Code ID: `436671`
- Script loaded in `<head>`: `https://js.onclckvd.com/in-stream-ad-admanager/tma.js`
- Used for Censor Claim (7 claims/day)

## Claim Code Format

```
[Prefix]-[YYYYMMDD]-v[1-7]
```

- **Prefix**: One of 25 valid prefixes: S9t, RSt, J9r, Kp2, Lm5, Nx7, Qr1, Yt3, Wv6, Bz4, Cf8, Dg9, Eh0, Fi2, Gj3, Hk4, Il5, Jm6, Kn7, Lo8, Mp9, Nq0, Or1, Ps2, Qt3
- **Date**: Current date in YYYYMMDD format (Asia/Dhaka timezone)
- **Claim Number**: v1 through v7, each can only be used once per day

Example: `S9t-20260418-v1`

## Environment Variables

Create a `.env` file:
```
VITE_MONETAG_ZONE_ID=10883491
VITE_ONCLICKA_SPOT_ID=6116695
VITE_ONCLICKA_AD_CODE_ID=436671
```

For GitHub Actions, add these to repository secrets:
- `VITE_MONETAG_ZONE_ID`
- `VITE_ONCLICKA_SPOT_ID`

## Build & Deployment

### Development
```bash
pnpm install
pnpm run dev
```

### Production Build
```bash
VITE_MONETAG_ZONE_ID=10883491 VITE_ONCLICKA_SPOT_ID=6116695 BASE_PATH=/censor-coin-tma/ pnpm run build
```

### GitHub Pages (Automatic)
Push to `main` branch → GitHub Actions builds and deploys to `gh-pages` branch.

Live URL: `https://shahadathakhand747.github.io/censor-coin-tma/`

## Bot & Channel Details

- Bot: @Censorcoin_bot (ID: 8246412319)
- Channel: @censorcoin (ID: -1003925758863)
- Referral URL: `https://t.me/Censorcoin_bot?start={referral_code}`

## Tech Stack

- React 18 + TypeScript
- Vite 5 + Tailwind CSS v4
- shadcn/ui components
- @telegram-apps/sdk-react v3
- react-router-dom v7
- framer-motion
- react-i18next
- use-sound
- monetag-tg-sdk
