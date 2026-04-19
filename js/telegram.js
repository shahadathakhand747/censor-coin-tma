/* ===== telegram.js ===== */

/** Initialize Telegram WebApp */
function initTelegram() {
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) return;
    tg.ready();
    tg.expand();
    // Hide "View in Browser" button available in Telegram environment
    if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes();
    if (typeof tg.lockOrientation === 'function') tg.lockOrientation();
    // Request full-screen if available
    if (typeof tg.requestFullscreen === 'function') {
      try { tg.requestFullscreen(); } catch(e) {}
    }
    // Set theme colors
    if (typeof tg.setHeaderColor === 'function') {
      try { tg.setHeaderColor('#0D0D0D'); } catch(e) {}
    }
    if (typeof tg.setBackgroundColor === 'function') {
      try { tg.setBackgroundColor('#0D0D0D'); } catch(e) {}
    }
  } catch (e) {
    console.warn('Telegram init error:', e);
  }
}

/** Get user data from Telegram WebApp */
function getUserData() {
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) return null;
    const user = tg.initDataUnsafe && tg.initDataUnsafe.user;
    if (!user) return null;
    return {
      id: user.id,
      username: user.username || '',
      first_name: user.first_name || 'User',
      photo_url: user.photo_url || null
    };
  } catch (e) {
    return null;
  }
}

/** Get start parameter (referral code) */
function getStartParam() {
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) return null;
    return (tg.initDataUnsafe && tg.initDataUnsafe.start_param) || null;
  } catch (e) {
    return null;
  }
}

/** Detect if running inside Telegram */
function isInTelegram() {
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    return !!(tg && tg.initData && tg.initData.length > 0);
  } catch (e) {
    return false;
  }
}

/** Open a Telegram link */
function openTgLink(url) {
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && typeof tg.openTelegramLink === 'function') {
      tg.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  } catch (e) {
    window.open(url, '_blank');
  }
}

/** Open an external link */
function openExternalLink(url) {
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && typeof tg.openLink === 'function') {
      tg.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  } catch (e) {
    window.open(url, '_blank');
  }
}
