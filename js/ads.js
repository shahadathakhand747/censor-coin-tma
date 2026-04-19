/* ===== ads.js ===== */

/** Initialize ad networks */
function initAds() {
  // OnClickA TMA init
  try {
    if (window.initCdTma) {
      window.initCdTma({ id: CONFIG.ONCLICKA_SPOT })
        .then(function(show) {
          window.showOnClickA = show;
        })
        .catch(function(e) {
          console.warn('OnClickA init failed:', e);
        });
    }
  } catch(e) {
    console.warn('initAds OnClickA error:', e);
  }
}

/**
 * Show Monetag ad.
 * type 'pop' → show_10883491('pop')
 * anything else → show_10883491()
 */
function showMonetagAd(type) {
  try {
    if (typeof show_10883491 === 'function') {
      if (type === 'pop') {
        return show_10883491('pop');
      } else {
        return show_10883491();
      }
    }
  } catch(e) {
    console.warn('showMonetagAd error:', e);
  }
  return Promise.resolve();
}

/** Show OnClickA ad */
function showOnClickAAd() {
  try {
    if (typeof window.showOnClickA === 'function') {
      return window.showOnClickA();
    }
  } catch(e) {
    console.warn('showOnClickAAd error:', e);
  }
  return Promise.resolve();
}
