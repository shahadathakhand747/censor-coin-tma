/* ===== utils.js ===== */

/** Returns 'YYYY-MM-DD' in Asia/Dhaka timezone */
function getTodayBD() {
  const d = new Date();
  const opts = { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' };
  const parts = new Intl.DateTimeFormat('en-CA', opts).format(d); // en-CA gives YYYY-MM-DD
  return parts;
}

/** Format numbers: 1500 → "1.5K", 1000000 → "1M" */
function formatNumber(num) {
  if (!num || isNaN(num)) return '0';
  num = Math.floor(num);
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

/** Show a temporary toast notification */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const icon = document.createElement('span');
  icon.textContent = icons[type] || icons.info;

  const text = document.createElement('span');
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/** Copy text to clipboard */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
    }
    showToast('Copied to clipboard!', 'success');
    return true;
  } catch (e) {
    showToast('Failed to copy', 'error');
    return false;
  }
}

/**
 * Validate a claim code.
 * Code format (internal only — never exposed in UI):
 *   [PREFIX][YYYYMMDD][N]
 *   where PREFIX is one of CONFIG.ALLOWED_CLAIM_PREFIXES,
 *   YYYYMMDD is today's date in BD timezone,
 *   N is 1-7 (claim slot number).
 *
 * Returns { valid: bool, claimNumber: int|null, error: string|null }
 * Errors are GENERIC — never reveal the format.
 */
function validateClaimCode(code, usedCodes) {
  if (!code || typeof code !== 'string') {
    return { valid: false, claimNumber: null, error: 'Invalid code.' };
  }

  const trimmed = code.trim();

  // Find matching prefix
  let matchedPrefix = null;
  for (const prefix of CONFIG.ALLOWED_CLAIM_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      matchedPrefix = prefix;
      break;
    }
  }

  if (!matchedPrefix) {
    return { valid: false, claimNumber: null, error: 'Invalid code.' };
  }

  const rest = trimmed.slice(matchedPrefix.length); // should be YYYYMMDD + N

  // rest must be exactly 9 chars (8 for date + 1 for claim number)
  if (rest.length !== 9) {
    return { valid: false, claimNumber: null, error: 'Invalid code.' };
  }

  const datePart = rest.slice(0, 8); // YYYYMMDD
  const claimChar = rest.slice(8);   // 1-7

  // Validate date
  const todayBD = getTodayBD().replace(/-/g, ''); // YYYYMMDD
  if (datePart !== todayBD) {
    return { valid: false, claimNumber: null, error: 'Code has expired or is not valid today.' };
  }

  // Validate claim number
  const claimNumber = parseInt(claimChar, 10);
  if (isNaN(claimNumber) || claimNumber < 1 || claimNumber > 7) {
    return { valid: false, claimNumber: null, error: 'Invalid code.' };
  }

  // Check if already used
  const usedKey = 'v' + claimNumber;
  if (usedCodes && usedCodes.includes(usedKey)) {
    return { valid: false, claimNumber: null, error: 'This claim has already been used today.' };
  }

  return { valid: true, claimNumber: claimNumber, error: null };
}

/** Close any modal by ID */
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

/** Open modal by ID */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

/** Mask a TON address for display */
function maskAddress(addr) {
  if (!addr || addr.length < 10) return addr || 'Not set';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}
