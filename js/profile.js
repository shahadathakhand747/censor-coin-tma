/* ===== profile.js ===== */

function renderProfile() {
  if (!appState) return;

  // Avatar
  const avatar = document.getElementById('profile-avatar');
  if (avatar) {
    if (appState.profile_photo_url) {
      avatar.innerHTML = '<img src="' + appState.profile_photo_url + '" alt="avatar">';
    } else {
      const initial = (appState.first_name || 'U').charAt(0).toUpperCase();
      avatar.textContent = initial;
    }
  }

  // Name / username
  const nameEl = document.getElementById('profile-name');
  if (nameEl) nameEl.textContent = appState.first_name || 'User';

  const unameEl = document.getElementById('profile-username');
  if (unameEl) unameEl.textContent = appState.username ? '@' + appState.username : '';

  // Coins
  const coinsEl = document.getElementById('profile-coins-display');
  if (coinsEl) coinsEl.textContent = formatNumber(appState.total_points || 0);

  // TON address
  const tonEl = document.getElementById('profile-ton-display');
  if (tonEl) tonEl.textContent = maskAddress(appState.ton_address || '');

  // Referral stats
  const refersEl = document.getElementById('profile-total-refers');
  if (refersEl) refersEl.textContent = formatNumber(appState.total_refers || 0);

  const earnedEl = document.getElementById('profile-referral-earned');
  if (earnedEl) earnedEl.textContent = formatNumber((appState.total_refers || 0) * 6000);

  // Referral link
  const linkEl = document.getElementById('referral-link-display');
  if (linkEl) {
    const code = appState.referral_code || appState.username || 'user';
    linkEl.textContent = 'https://t.me/' + CONFIG.BOT_USERNAME.replace('@','') + '?start=' + code;
  }

  // Daily referral count (once per day)
  loadDailyReferralCount();

  // Language display
  const LANG_NAMES = { en: 'English', bn: 'বাংলা', hi: 'हिंदी', es: 'Español', ar: 'العربية', de: 'Deutsch' };
  const langEl = document.getElementById('profile-lang-display');
  if (langEl) langEl.textContent = LANG_NAMES[appState.language || 'en'] || 'English';
}

async function loadDailyReferralCount() {
  const today = getTodayBD();
  if (appState.last_referral_check_date === today) {
    // Already fetched today — just display
    const el = document.getElementById('profile-daily-refers');
    if (el) el.textContent = appState._daily_referral_count || 0;
    return;
  }

  try {
    const data = await fetchDailyReferralCount(appState.username || appState.first_name || '');
    const count = (data && data.count) || 0;
    appState._daily_referral_count = count;
    appState.last_referral_check_date = today;
    await storage.save(appState);

    const el = document.getElementById('profile-daily-refers');
    if (el) el.textContent = count;
  } catch(e) {}
}

function copyReferralLink() {
  const code = appState.referral_code || appState.username || 'user';
  const link = 'https://t.me/' + CONFIG.BOT_USERNAME.replace('@','') + '?start=' + code;
  copyToClipboard(link);
}

function openTutorial() {
  openExternalLink(CONFIG.SOCIAL_LINKS.youtube);
}

function openLegal(type) {
  const url = CONFIG.LEGAL[type];
  if (url) openTgLink(url);
}

/* ===== TON MODAL ===== */
function openTonModal() {
  const cooldownEl = document.getElementById('ton-cooldown-notice');
  const input = document.getElementById('ton-address-input');
  const saveBtn = document.getElementById('btn-ton-save');

  // Check 14-day cooldown
  const lastChange = appState.last_ton_address_change;
  let onCooldown = false;
  if (lastChange) {
    const daysSince = (Date.now() - new Date(lastChange).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 14) {
      onCooldown = true;
      const daysLeft = Math.ceil(14 - daysSince);
      if (cooldownEl) {
        cooldownEl.classList.remove('hidden');
        const textEl = document.getElementById('ton-cooldown-text');
        if (textEl) textEl.textContent = 'You can change your address in ' + daysLeft + ' day(s).';
      }
    }
  }

  if (!onCooldown && cooldownEl) cooldownEl.classList.add('hidden');

  if (input) {
    input.value = appState.ton_address || '';
    input.disabled = onCooldown;
  }
  if (saveBtn) saveBtn.disabled = onCooldown;

  openModal('ton-modal');
}

async function saveTonAddress() {
  const input = document.getElementById('ton-address-input');
  if (!input) return;

  const addr = input.value.trim();

  // Basic TON address validation (starts with UQ, EQ, or is 48 chars)
  if (!addr || addr.length < 10) {
    showToast(t('ton_invalid'), 'error');
    return;
  }

  appState.ton_address = addr;
  appState.last_ton_address_change = new Date().toISOString();
  await storage.save(appState);

  showToast(t('ton_saved'), 'success');
  closeModal('ton-modal');
  renderProfile();
}
