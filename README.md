# Censor Coin — Telegram Mini App (TMA)

A fully-featured Telegram Mini App (TMA) built with **pure HTML, CSS, and vanilla JavaScript**. No frameworks. No build tools. No dependencies beyond CDN libraries.

---

## Overview

Censor Coin is a reward-based Telegram Mini App where users earn coins by:
1. **Daily Censoring** — Review 6 sets of 3 random images per day (+5,000 coins each)
2. **Censor Claim** — Enter daily claim codes for bonus coins (+3,000 coins each, up to 7/day)
3. **Social Tasks** — Follow on YouTube, TikTok, and Facebook (+10,000 coins each, one-time)
4. **Referrals** — Invite friends via unique referral link

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Pure HTML5, CSS3, Vanilla JavaScript (ES6+) |
| State | In-memory JS object + Telegram CloudStorage |
| Animations | Lottie Web (bodymovin 5.12.2) |
| Audio | Howler.js 2.2.4 |
| Icons | Phosphor Icons 2.1.1 |
| Utility CSS | Tailwind CSS 2 (CDN only) |
| Telegram | Telegram WebApp JS SDK |
| Ads | Monetag (Zone: 10883491), OnClickA (Spot: 6116695) |

---

## File Structure

```
censor-coin-tma/
├── index.html       ← App shell, CDN imports, page containers
├── styles.css       ← Charcoal black theme, mobile-first, max-width 480px
├── app.js           ← All app logic (state, rendering, API calls, ads)
├── assets/
│   ├── click.mp3    ← UI click/interaction sound effect
│   └── coin.mp3     ← Coin reward chime sound effect
└── README.md        ← This file
```

---

## CloudStorage Schema

User data is stored under a single key `censorCoinUser_v1` in Telegram CloudStorage.

```json
{
  "membership_verified": false,
  "reg_status": "unregistered",
  "referral_code": "",
  "username": "",
  "first_name": "",
  "profile_photo_url": null,
  "total_points": 0,
  "total_refers": 0,
  "today_tasks_completed": 0,
  "claim_codes_used": [],
  "youtube_completed": false,
  "tiktok_completed": false,
  "facebook_completed": false,
  "last_referral_check_date": "",
  "ton_address": "",
  "last_ton_address_change": "",
  "language": "en",
  "schema_version": 1,
  "last_reset_date": ""
}
```

### 4KB Limit

Telegram CloudStorage values are capped at **4,096 bytes**. The app:
- Serialises user data to JSON before saving
- If the JSON exceeds 4KB, it trims `claim_codes_used` to the latest 15 entries
- `claim_codes_used` entries use short keys like `v1`–`v7`, minimising storage use

### Daily Reset

On each app launch, the Bangladesh date (`Asia/Dhaka` timezone, `YYYY-MM-DD`) is compared with `last_reset_date`. If different, `today_tasks_completed` and `claim_codes_used` are both reset to zero/empty.

---

## API Endpoints

### Verify Membership

```
POST https://telegram-membership-bot-kwq6.onrender.com/verify

Body: { "user_id": 123456789, "channel_username": "-1003925758863" }
Returns: { "is_member": true }
```

Called when user taps "Verify Membership". If `is_member` is `true`, the user passes the gate.

### Register User

```
POST https://tma-referral-worker.shahadathakhand7.workers.dev/api/register

Body: {
  "telegram_id": 123456789,
  "username": "johndoe",
  "first_name": "John",
  "referral_code_used": "ABC12345"
}
Returns: { "referral_code": "XYZ98765" }
```

Called once per new user. The returned `referral_code` is stored in CloudStorage and used in the shareable bot link.

### Daily Referral Count

```
GET https://tma-referral-worker.shahadathakhand7.workers.dev/api/daily-referral-count?telegram_id=123456789

Returns: { "count": 5 }
```

Called **once per day** (compared against `last_referral_check_date`) to update `total_refers`.

---

## Ad Integrations

### Monetag (Zone: 10883491)

Script added to `<head>`:
```html
<script src='//libtl.com/sdk.js' data-zone='10883491' data-sdk='show_10883491'></script>
```

Usage in `app.js`:

| Task Number | Ad Type | Function Call |
|---|---|---|
| 1st, 3rd, 5th, 6th task | Rewarded Interstitial | `show_10883491()` |
| 2nd, 4th task | Rewarded Pop | `show_10883491('pop')` |

Both return a Promise. Coins are awarded regardless of whether the ad completes.

### OnClickA (Spot: 6116695)

Script added to `<head>`:
```html
<script src="https://js.onclckvd.com/in-stream-ad-admanager/tma.js"></script>
```

Initialisation on app startup:
```js
window.initCdTma({ id: '6116695' })
  .then(show => window.showAd = show)
  .catch(e => console.log(e));
```

Triggered when a valid Censor Claim code is submitted:
```js
window.showAd()
  .then(() => { /* reward +3000 coins */ })
  .catch(e => console.log(e));
```

---

## Claim Code Validation

Claim codes follow the pattern: **`{prefix}{YYYYMMDD}{N}`**

- **prefix**: one of `S9t`, `RSt`, `J9r`, `K4m`, `L7p`, `Q2w`, `Z8x`, `P3n`, `T6v`, `X1m`
- **YYYYMMDD**: today's date in Bangladesh timezone (`Asia/Dhaka`)
- **N**: claim number, 1–7

Example: `S9t202604191` = prefix `S9t`, date April 19 2026, claim number 1.

Validation rules:
1. Code starts with a valid prefix
2. Date portion matches today's Bangladesh date
3. Claim number is between 1–7
4. The corresponding `v{N}` key is NOT already in `claim_codes_used`
5. The format is not shown to users (no placeholder hint)

---

## Multi-Language Support

6 languages supported:

| Code | Language | RTL? |
|---|---|---|
| `en` | English | No |
| `bn` | Bengali (Bangla) | No |
| `hi` | Hindi | No |
| `es` | Spanish | No |
| `ar` | Arabic | **Yes** |
| `de` | German | No |

Language preference saved to CloudStorage under `language`. Arabic activates RTL (`dir="rtl"`) on `<html>`. All UI strings use the `t(key)` function which looks up `LANG[lang][key]`.

---

## Sound Effects

Both sounds use Howler.js for cross-platform audio:

| Sound | File | Trigger |
|---|---|---|
| Click | `assets/click.mp3` | Every button tap, nav switch, modal open/close |
| Coin | `assets/coin.mp3` | When coins are awarded |

---

## Pages

| Page | ID | Description |
|---|---|---|
| Home | `page-home` | Total points, stats (refers/tasks/claims), hero chart, Lottie animation |
| Earn | `page-earn` | Daily Censoring tasks, Censor Claim code input, Social Tasks |
| Profile | `page-profile` | Avatar, TON address, referral link/stats, language selector, legal links |

---

## Deployment

### Static Hosting (Any)

1. Upload the entire `censor-coin-tma/` folder to any static host
2. No build step required — serve `index.html` directly

### Cloudflare Pages

1. Create a GitHub repository and push all files
2. In Cloudflare Pages dashboard, connect the GitHub repo
3. Set **Build command**: *(leave empty)*
4. Set **Publish directory**: `/` (root)
5. Deploy — Cloudflare Pages will serve `index.html` automatically

### Telegram Bot Setup

1. Set the Mini App URL in `@BotFather` → Edit Bot → Edit Menu Button → Web App URL
2. Optionally configure `start_param` for referral tracking

---

## Security Notes

- No sensitive tokens are hardcoded in frontend files
- Telegram `initData` should be validated server-side before trusting
- `initDataUnsafe` is used only for UI display (name, username, photo)
- CloudStorage keys are namespaced (`censorCoinUser_v1`) to avoid collisions

---

## Browser Fallback

When running outside Telegram (e.g., in a regular browser for testing):
- `window.Telegram.WebApp` is absent — all CloudStorage operations fall back to `localStorage`
- `initDataUnsafe.user` is absent — UI shows generic placeholder values
- Ad SDKs may not load — ad functions fall back gracefully with a `setTimeout` resolve
