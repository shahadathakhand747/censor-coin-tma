/* ===== app.js — Main initialization ===== */

let clickSound = null;
let coinSound = null;
let rewardLottieAnim = null;

/** === SOUNDS === */
function initSounds() {
  try {
    clickSound = new Howl({
      src: [CONFIG.SOUNDS.click],
      volume: 0.4,
      preload: true
    });
    coinSound = new Howl({
      src: [CONFIG.SOUNDS.coin],
      volume: 0.6,
      preload: true
    });
  } catch(e) {
    console.warn('Sound init failed:', e);
  }
}

function playClickSound() {
  try { if (clickSound) clickSound.play(); } catch(e) {}
}

function playCoinSound() {
  try { if (coinSound) coinSound.play(); } catch(e) {}
}

/** === LOTTIE REWARD === */
function showCoinReward(amount) {
  const overlay = document.getElementById('lottie-reward');
  const amountEl = document.getElementById('reward-amount');
  const animContainer = document.getElementById('reward-lottie-anim');

  if (amountEl) amountEl.textContent = '+' + formatNumber(amount);
  if (overlay) overlay.classList.remove('hidden');

  // Load Lottie only once
  if (animContainer && !rewardLottieAnim) {
    try {
      rewardLottieAnim = lottie.loadAnimation({
        container: animContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://assets2.lottiefiles.com/packages/lf20_7cuhl9zs.json'
      });
    } catch(e) {
      animContainer.innerHTML = '<div style="font-size:80px;text-align:center;">🎉</div>';
    }
  } else if (rewardLottieAnim) {
    try { rewardLottieAnim.play(); } catch(e) {}
  }

  // Auto-close after 2 seconds
  setTimeout(function() {
    if (overlay) overlay.classList.add('hidden');
    if (rewardLottieAnim) { try { rewardLottieAnim.stop(); } catch(e) {} }
  }, 2000);
}

/** === NAVIGATION === */
function switchPage(page) {
  const pages = ['home', 'earn', 'profile'];
  pages.forEach(function(p) {
    const el = document.getElementById(p + '-page');
    if (el) el.classList.toggle('hidden', p !== page);
  });

  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-page') === page);
  });

  // Render the page
  if (page === 'home') renderHome();
  if (page === 'earn') renderEarn();
  if (page === 'profile') renderProfile();

  playClickSound();
}

/** === GLOBAL CLICK SOUND via delegation === */
function initGlobalClickSound() {
  document.addEventListener('click', function(e) {
    const target = e.target.closest('button, .nav-btn, .task-card, .social-card, .quick-action-btn, .lang-option');
    if (target) playClickSound();
  }, { passive: true });
}

/** === MEMBERSHIP VERIFICATION FLOW === */
async function joinChannel() {
  openTgLink('https://t.me/censorcoin');
}

async function verifyAndProceed() {
  const userData = getUserData();
  const userId = userData ? userData.id : null;

  if (!userId) {
    // Browser environment fallback
    showToast('Cannot verify in browser — use Telegram', 'info');
    return;
  }

  showToast('Verifying membership...', 'info');

  try {
    const result = await verifyMembership(userId);
    if (result && (result.is_member || result.status === 'member' || result.member === true)) {
      appState.membership_verified = true;
      await storage.save(appState);
      proceedToApp();
    } else {
      showToast(t('verify_fail'), 'error');
    }
  } catch(e) {
    showToast('Verification failed. Please try again.', 'error');
  }
}

/** Browser-only bypass (hidden in Telegram) */
function bypassVerify() {
  appState.membership_verified = true;
  storage.save(appState);
  proceedToApp();
}

function proceedToApp() {
  closeModal('verify-modal');
  document.getElementById('verify-modal').classList.add('hidden');
  showApp();
}

function showApp() {
  const appContainer = document.getElementById('app-container');
  if (appContainer) appContainer.classList.remove('hidden');
  switchPage('home');
  applyLanguage();
}

/** === INITIALIZATION === */
async function init() {
  // 1. Init Telegram
  initTelegram();

  // 2. Init Ads
  initAds();

  // 3. Init sounds
  initSounds();

  // 4. Init global click sound
  initGlobalClickSound();

  // 5. Load state
  await storage.load();

  // 6. Apply saved language
  applyLanguage();

  // 7. Show splash for 2.5s
  setTimeout(async function() {
    const splash = document.getElementById('splash-screen');

    const inTelegram = isInTelegram();
    const userData = getUserData();

    // Populate user data from Telegram
    if (userData) {
      appState.username = userData.username || appState.username;
      appState.first_name = userData.first_name || appState.first_name;
      if (userData.photo_url) appState.profile_photo_url = userData.photo_url;
    }

    if (appState.membership_verified) {
      // Already verified — go straight to app
      if (splash) {
        splash.style.opacity = '0';
        setTimeout(function() { splash.classList.add('hidden'); }, 400);
      }

      // Register if not registered
      if (appState.reg_status !== 'registered' && userData) {
        const startParam = getStartParam();
        try {
          const res = await registerUser(userData.id, userData.username, userData.first_name, startParam);
          if (res && !res.error) {
            appState.reg_status = 'registered';
            if (res.referral_code) appState.referral_code = res.referral_code;
            if (res.total_refers !== undefined) appState.total_refers = res.total_refers;
            await storage.save(appState);
          }
        } catch(e) {}
      }

      showApp();
    } else {
      // Show verify modal
      if (splash) {
        splash.style.opacity = '0';
        setTimeout(function() { splash.classList.add('hidden'); }, 400);
      }

      const verifyModal = document.getElementById('verify-modal');
      if (verifyModal) verifyModal.classList.remove('hidden');

      // Show browser preview button ONLY when NOT in Telegram
      const browserBtn = document.getElementById('browser-preview-btn');
      if (browserBtn && !inTelegram) {
        browserBtn.classList.remove('hidden');
      }

      // Auto-verify if in Telegram and we can detect user
      if (inTelegram && userData) {
        // Try auto-verify
        try {
          const result = await verifyMembership(userData.id);
          if (result && (result.is_member || result.status === 'member' || result.member === true)) {
            appState.membership_verified = true;

            // Register
            const startParam = getStartParam();
            try {
              const res = await registerUser(userData.id, userData.username, userData.first_name, startParam);
              if (res && !res.error) {
                appState.reg_status = 'registered';
                if (res.referral_code) appState.referral_code = res.referral_code;
                if (res.total_refers !== undefined) appState.total_refers = res.total_refers;
              }
            } catch(e) {}

            await storage.save(appState);
            proceedToApp();
          }
        } catch(e) {}
      }
    }

  }, 2500);
}

// Kick off when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
