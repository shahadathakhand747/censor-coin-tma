# Censor Coin TMA

A fully production-ready Telegram Mini App (TMA) for the Censor Coin project.

## Tech Stack

- Pure vanilla HTML5 / CSS3 / JavaScript (ES6+)
- Zero frameworks, zero build tools, zero npm
- CDN libraries: Tailwind CSS v2, Phosphor Icons, Lottie Web, Howler.js
- Telegram WebApp SDK
- Ad SDKs: Monetag, OnClickA

## Features

- 7 daily claim codes (validated by prefix + date + slot)
- 6 daily moderation tasks (image review with preset labels)
- 3 social tasks (YouTube, TikTok, Facebook) with 2-min timer
- 6-language support (EN, BN, HI, ES, AR, DE)
- Referral system with coin rewards
- TON wallet address with 14-day cooldown
- Browser preview mode (hidden in Telegram, shown in browser)
- Charcoal black theme, mobile-first

## Claim Code Format

Codes are validated client-side using 25 allowed prefixes + today's date in BD timezone + a claim slot number (1–7). The format is intentionally NOT revealed in the UI.

## CloudStorage Schema

State is stored in Telegram CloudStorage (fallback: localStorage). Max size: 4096 bytes.

| Field | Type | Description |
|---|---|---|
| membership_verified | bool | Channel membership confirmed |
| reg_status | string | 'unregistered' or 'registered' |
| total_points | number | Total earned coins |
| total_refers | number | Total successful referrals |
| today_tasks_completed | number | Tasks done today (0–6) |
| claim_codes_used | array | Claim slots used today (e.g. ['v1','v3']) |
| ton_address | string | User's TON wallet address |
| language | string | UI language code |

## API Endpoints

| Method | URL | Description |
|---|---|---|
| POST | /verify | Verify channel membership |
| POST | /api/register | Register user with referral |
| GET | /api/daily-referral-count | Get today's referral count |

### verifyMembership
```
POST https://telegram-membership-bot-kwq6.onrender.com/verify
Body: { user_id, channel_username: "-1003925758863" }
```

### registerUser
```
POST https://tma-referral-worker.shahadathakhand7.workers.dev/api/register
Body: { telegram_id, username, first_name, referral_code_used }
```

## Ad Integrations

### Monetag
- Zone ID: `10883491`
- SDK: `//libtl.com/sdk.js`
- Usage: `show_10883491('pop')` or `show_10883491()`

### OnClickA
- Spot ID: `6116695`
- SDK: `https://js.onclckvd.com/in-stream-ad-admanager/tma.js`
- Usage: `initCdTma({ id: '6116695' }).then(show => show())`

Task ad mapping:
- Tasks 2 & 4 (index 1, 3): Monetag pop
- Tasks 1, 3, 5, 6 (index 0, 2, 4, 5): Monetag interstitial
- Claim codes: OnClickA

## Multi-Language Support

Languages: English (en), Bengali (bn), Hindi (hi), Spanish (es), Arabic (ar), German (de)

All UI strings are stored in `js/i18n.js` in the `TRANSLATIONS` object.
RTL support is applied automatically for Arabic.

## Deployment

### GitHub + Cloudflare Pages

1. Push this repository to GitHub
2. Go to Cloudflare Pages → Create Project
3. Connect to GitHub → select this repo
4. Build command: (none — static site)
5. Output directory: `/` (root)
6. Deploy
