/* ===== earn.js ===== */

const TASK_DEFINITIONS = [
  { id: 'task1', name: 'Review Content Batch A', icon: '🛡️', reward: 5000 },
  { id: 'task2', name: 'Review Content Batch B', icon: '🔍', reward: 5000 },
  { id: 'task3', name: 'Review Content Batch C', icon: '📋', reward: 5000 },
  { id: 'task4', name: 'Review Content Batch D', icon: '⚠️', reward: 5000 },
  { id: 'task5', name: 'Review Content Batch E', icon: '🧹', reward: 5000 },
  { id: 'task6', name: 'Review Content Batch F', icon: '✅', reward: 5000 }
];

const MODERATION_PRESETS = [
  { id: 'spam',       label: '🚫 Spam',            cls: 'preset-spam',       verdict: 'violates' },
  { id: 'violence',   label: '⚔️ Violence',         cls: 'preset-violence',   verdict: 'violates' },
  { id: 'hate',       label: '🧨 Hate Speech',      cls: 'preset-hate',       verdict: 'violates' },
  { id: 'adult',      label: '🔞 Adult Content',    cls: 'preset-adult',      verdict: 'violates' },
  { id: 'misleading', label: '📢 Misleading Info',  cls: 'preset-misleading', verdict: 'violates' },
  { id: 'harassment', label: '😡 Harassment',       cls: 'preset-harassment', verdict: 'violates' },
  { id: 'copyright',  label: '©️ Copyright',        cls: 'preset-copyright',  verdict: 'violates' },
  { id: 'self_harm',  label: '💔 Self-Harm',        cls: 'preset-self-harm',  verdict: 'violates' },
  { id: 'safe',       label: '✅ Looks Safe',        cls: 'preset-safe',       verdict: 'safe' },
  { id: 'off_topic',  label: '🌀 Off-Topic',        cls: 'preset-off-topic',  verdict: 'safe' }
];

let currentTaskIndex = null;
let currentImageIndex = 0;
let currentVerdict = null;
let selectedPreset = null;
let taskImages = [];
let socialTimers = {};

function renderEarn() {
  if (!appState) return;

  // Update points display
  const earnPoints = document.getElementById('earn-points-display');
  if (earnPoints) earnPoints.textContent = formatNumber(appState.total_points || 0);

  // Render claim slots
  renderClaimSlots();

  // Render task cards
  renderTaskCards();

  // Render social cards
  renderSocialCards();

  // Update claim progress badge
  updateClaimBadge();
}

function renderClaimSlots() {
  const container = document.getElementById('claim-slots');
  if (!container) return;
  const used = appState.claim_codes_used || [];
  let html = '';
  for (let i = 1; i <= 7; i++) {
    const isClaimed = used.includes('v' + i);
    html += '<div class="claim-slot ' + (isClaimed ? 'claimed' : '') + '">' + (isClaimed ? '' : i) + '</div>';
  }
  container.innerHTML = html;
}

function updateClaimBadge() {
  const badge = document.getElementById('claim-progress-badge');
  const used = (appState.claim_codes_used || []).length;
  if (badge) badge.textContent = used + '/7';
}

function renderTaskCards() {
  const container = document.getElementById('task-list');
  if (!container) return;

  const tasksDone = appState.today_tasks_completed || 0;
  const taskBadge = document.getElementById('task-progress-badge');
  if (taskBadge) taskBadge.textContent = tasksDone + '/6';

  let html = '';
  TASK_DEFINITIONS.forEach(function(task, idx) {
    const done = idx < tasksDone;
    html += '<div class="task-card ' + (done ? 'completed' : '') + '" onclick="' + (done ? '' : 'openTaskModal(' + idx + ')') + '">' +
      '<div class="task-icon">' + task.icon + '</div>' +
      '<div class="task-info">' +
        '<div class="task-name">' + task.name + '</div>' +
        '<div class="task-reward">+' + formatNumber(task.reward) + ' coins</div>' +
      '</div>' +
      (done ? '' : '<i class="ph ph-caret-right task-arrow"></i>') +
    '</div>';
  });
  container.innerHTML = html;
}

function renderSocialCards() {
  const container = document.getElementById('social-list');
  if (!container) return;

  const socials = [
    { id: 'youtube', name: 'YouTube', icon: '▶', iconCls: 'yt', doneKey: 'youtube_completed', url: CONFIG.SOCIAL_LINKS.youtube },
    { id: 'tiktok',  name: 'TikTok',  icon: '♪', iconCls: 'tt', doneKey: 'tiktok_completed',  url: CONFIG.SOCIAL_LINKS.tiktok },
    { id: 'facebook',name: 'Facebook',icon: 'f',  iconCls: 'fb', doneKey: 'facebook_completed', url: CONFIG.SOCIAL_LINKS.facebook }
  ];

  let html = '';
  socials.forEach(function(s) {
    const done = !!appState[s.doneKey];
    const timerRunning = !!socialTimers[s.id];
    html += '<div class="social-card ' + (done ? 'completed' : '') + '" id="social-card-' + s.id + '" onclick="' + (done ? '' : 'handleSocialClick(\'' + s.id + '\',\'' + s.url + '\',\'' + s.doneKey + '\')') + '">' +
      '<div class="social-icon ' + s.iconCls + '"><b>' + s.icon + '</b></div>' +
      '<div class="social-info">' +
        '<div class="social-name">' + s.name + '</div>' +
        '<div class="social-reward">+10,000 coins</div>' +
        (timerRunning ? '<div class="social-timer" id="timer-' + s.id + '">⏳ Waiting...</div>' : '') +
      '</div>' +
    '</div>';
  });
  container.innerHTML = html;
}

/* ===== CLAIM MODAL ===== */
function openClaimModal() {
  const used = appState.claim_codes_used || [];

  // Update dots
  const dotsContainer = document.getElementById('claim-dots');
  if (dotsContainer) {
    let dotsHtml = '';
    for (let i = 1; i <= 7; i++) {
      const claimed = used.includes('v' + i);
      dotsHtml += '<div class="claim-dot ' + (claimed ? 'claimed' : '') + '">' + (claimed ? '✓' : i) + '</div>';
    }
    dotsContainer.innerHTML = dotsHtml;
  }

  // Update progress bar
  const bar = document.getElementById('claim-modal-bar');
  if (bar) bar.style.width = (used.length / 7 * 100) + '%';

  const progressEl = document.getElementById('claim-modal-progress');
  if (progressEl) progressEl.textContent = used.length + ' / 7';

  // Clear previous state
  const input = document.getElementById('claim-code-input');
  if (input) input.value = '';

  const errEl = document.getElementById('claim-modal-error');
  if (errEl) errEl.classList.add('hidden');

  openModal('claim-modal');
}

async function submitClaimCode() {
  const input = document.getElementById('claim-code-input');
  const errEl = document.getElementById('claim-modal-error');
  if (!input) return;

  const code = input.value.trim();
  if (!code) return;

  const used = appState.claim_codes_used || [];
  const result = validateClaimCode(code, used);

  if (!result.valid) {
    errEl.textContent = result.error || t('invalid_code');
    errEl.classList.remove('hidden');
    return;
  }

  errEl.classList.add('hidden');

  // Show ad then award
  try { await showOnClickAAd(); } catch(e) {}

  // Award coins
  const claimKey = 'v' + result.claimNumber;
  appState.total_points = (appState.total_points || 0) + 3000;
  appState.claim_codes_used = [...used, claimKey];
  await storage.save(appState);

  playCoinSound();
  showCoinReward(3000);
  showToast(t('claim_success'), 'success');

  // Refresh modal state
  openClaimModal();
  input.value = '';

  // Refresh earn page
  renderEarn();

  // Update home stats if visible
  if (!document.getElementById('home-page').classList.contains('hidden')) {
    renderHome();
  }
}

/* ===== TASK MODAL ===== */
function openTaskModal(taskIdx) {
  if (appState.today_tasks_completed >= 6) {
    showToast('All tasks completed for today!', 'info');
    return;
  }

  currentTaskIndex = taskIdx;
  currentImageIndex = 0;
  currentVerdict = null;
  selectedPreset = null;
  taskImages = generateTaskImages();

  // Update title
  const titleEl = document.getElementById('task-modal-title');
  if (titleEl) titleEl.textContent = TASK_DEFINITIONS[taskIdx].name;

  // Render presets
  const presetGrid = document.getElementById('preset-grid');
  if (presetGrid) {
    let html = '';
    MODERATION_PRESETS.forEach(function(p) {
      html += '<button class="preset-btn ' + p.cls + '" onclick="selectPreset(\'' + p.id + '\')">' + p.label + '</button>';
    });
    presetGrid.innerHTML = html;
  }

  loadTaskImage();
  resetTaskActions();
  openModal('task-modal');
}

function generateTaskImages() {
  const ids = [];
  while (ids.length < 3) {
    const id = Math.floor(Math.random() * 1000) + 1;
    if (!ids.includes(id)) ids.push(id);
  }
  return ids.map(function(id) { return 'https://picsum.photos/seed/' + id + '/400/250'; });
}

function loadTaskImage() {
  const img = document.getElementById('task-image');
  const counter = document.getElementById('task-img-current');
  if (img) img.src = taskImages[currentImageIndex];
  if (counter) counter.textContent = currentImageIndex + 1;
}

function resetTaskActions() {
  const nextBtn = document.getElementById('btn-task-next');
  if (nextBtn) {
    nextBtn.disabled = true;
    const label = document.getElementById('task-next-label');
    if (label) label.textContent = currentImageIndex < 2 ? t('next_image') : t('submit_task');
  }
  const verdictText = document.getElementById('verdict-text');
  if (verdictText) verdictText.textContent = 'None';
  // Reset preset buttons
  document.querySelectorAll('.preset-btn').forEach(function(b) { b.classList.remove('selected'); });
}

function selectPreset(presetId) {
  const preset = MODERATION_PRESETS.find(function(p) { return p.id === presetId; });
  if (!preset) return;
  selectedPreset = preset;
  currentVerdict = preset.verdict;

  // Update UI
  document.querySelectorAll('.preset-btn').forEach(function(b) { b.classList.remove('selected'); });
  const btn = document.querySelector('.preset-btn.' + preset.cls);
  if (btn) btn.classList.add('selected');

  const verdictText = document.getElementById('verdict-text');
  if (verdictText) {
    verdictText.textContent = preset.label;
    verdictText.style.color = preset.verdict === 'violates' ? 'var(--red)' : 'var(--green)';
  }

  // Enable next button
  const nextBtn = document.getElementById('btn-task-next');
  if (nextBtn) nextBtn.disabled = false;
}

function selectVerdict(v) {
  currentVerdict = v;
  const verdictText = document.getElementById('verdict-text');
  if (verdictText) {
    verdictText.textContent = v === 'violates' ? t('violates') : t('safe');
    verdictText.style.color = v === 'violates' ? 'var(--red)' : 'var(--green)';
  }
  const nextBtn = document.getElementById('btn-task-next');
  if (nextBtn) nextBtn.disabled = false;
}

async function taskNext() {
  if (!currentVerdict) return;

  if (currentImageIndex < 2) {
    // Move to next image
    currentImageIndex++;
    currentVerdict = null;
    selectedPreset = null;
    loadTaskImage();
    resetTaskActions();

    // Update next button label on last image
    const label = document.getElementById('task-next-label');
    if (label) label.textContent = currentImageIndex === 2 ? t('submit_task') : t('next_image');
  } else {
    // Submit — show ad based on task index
    closeModal('task-modal');

    try {
      if (currentTaskIndex === 1 || currentTaskIndex === 3) {
        await showMonetagAd('pop');
      } else {
        await showMonetagAd('interstitial');
      }
    } catch(e) {}

    // Award coins
    appState.total_points = (appState.total_points || 0) + 5000;
    appState.today_tasks_completed = (appState.today_tasks_completed || 0) + 1;
    await storage.save(appState);

    playCoinSound();
    showCoinReward(5000);
    showToast(t('task_complete'), 'success');
    renderEarn();

    if (!document.getElementById('home-page').classList.contains('hidden')) {
      renderHome();
    }
  }
}

/* ===== SOCIAL TASKS ===== */
function handleSocialClick(socialId, url, doneKey) {
  if (appState[doneKey]) return;
  if (socialTimers[socialId]) return; // already waiting

  openExternalLink(url);

  // Start 2-minute countdown
  let remaining = 120;
  const timerEl = document.getElementById('timer-' + socialId);

  // Create timer display if not in DOM yet
  const card = document.getElementById('social-card-' + socialId);
  let timerDisplay = document.getElementById('timer-' + socialId);
  if (!timerDisplay && card) {
    const info = card.querySelector('.social-info');
    if (info) {
      timerDisplay = document.createElement('div');
      timerDisplay.className = 'social-timer';
      timerDisplay.id = 'timer-' + socialId;
      info.appendChild(timerDisplay);
    }
  }

  socialTimers[socialId] = setInterval(async function() {
    remaining--;
    if (timerDisplay) timerDisplay.textContent = '⏳ ' + remaining + 's remaining';

    if (remaining <= 0) {
      clearInterval(socialTimers[socialId]);
      delete socialTimers[socialId];

      // Award
      appState[doneKey] = true;
      appState.total_points = (appState.total_points || 0) + 10000;
      await storage.save(appState);

      playCoinSound();
      showCoinReward(10000);
      showToast(t('social_success'), 'success');
      renderEarn();

      if (!document.getElementById('home-page').classList.contains('hidden')) {
        renderHome();
      }
    }
  }, 1000);
}
