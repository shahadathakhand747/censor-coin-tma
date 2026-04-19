/* ===== home.js ===== */

let homeLottieAnim = null;

function renderHome() {
  if (!appState) return;

  // Avatar
  const avatar = document.getElementById('home-avatar');
  if (avatar) {
    if (appState.profile_photo_url) {
      avatar.innerHTML = '<img src="' + appState.profile_photo_url + '" alt="avatar">';
    } else {
      const initial = (appState.first_name || 'U').charAt(0).toUpperCase();
      avatar.textContent = initial;
    }
  }

  // Username
  const uname = document.getElementById('home-username');
  if (uname) uname.textContent = appState.first_name || appState.username || 'User';

  // Stats
  const points = document.getElementById('home-total-points');
  if (points) points.textContent = formatNumber(appState.total_points || 0);

  const refers = document.getElementById('home-total-refers');
  if (refers) refers.textContent = formatNumber(appState.total_refers || 0);

  const tasks = document.getElementById('home-tasks-done');
  if (tasks) tasks.textContent = (appState.today_tasks_completed || 0) + '';

  const refCoins = document.getElementById('home-referral-coins');
  if (refCoins) refCoins.textContent = formatNumber((appState.total_refers || 0) * 6000);

  // Daily progress bar
  const tasksDone = appState.today_tasks_completed || 0;
  const claimsDone = (appState.claim_codes_used || []).length;
  const socialDone = [appState.youtube_completed, appState.tiktok_completed, appState.facebook_completed].filter(Boolean).length;
  const totalDone = tasksDone;
  const totalMax = 6;

  const progressText = document.getElementById('home-progress-text');
  if (progressText) progressText.textContent = tasksDone + '/' + totalMax;

  const bar = document.getElementById('home-progress-bar');
  if (bar) bar.style.width = Math.min(100, (tasksDone / totalMax) * 100) + '%';

  // Load Lottie animation
  loadHomeLottie();
}

function loadHomeLottie() {
  const container = document.getElementById('home-lottie');
  if (!container || homeLottieAnim) return;

  try {
    homeLottieAnim = lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'https://assets9.lottiefiles.com/packages/lf20_4kx2q32n.json'
    });
  } catch(e) {
    // Fallback: use coin icon
    container.innerHTML = '<div style="font-size:80px;text-align:center;padding:20px;">🪙</div>';
  }
}
