/* ═══════════════════════════════════════════════════
   CENSOR COIN — APP.JS
   Vanilla JavaScript | No Framework | No Build Tools
   ═══════════════════════════════════════════════════ */

'use strict';

// ── DISABLE RIGHT CLICK ───────────────────────────
document.addEventListener('contextmenu', function(e) { e.preventDefault(); });

// ── CONSTANTS ─────────────────────────────────────
var CONFIG = {
  STORAGE_KEY: 'censorCoinUser_v1',
  CHANNEL_USERNAME: '-1003925758863',
  CHANNEL_LINK: 'https://t.me/censorcoin',
  BOT_LINK: 'https://t.me/Censorcoin_bot',
  VERIFY_URL: 'https://telegram-membership-bot-kwq6.onrender.com/verify',
  REGISTER_URL: 'https://tma-referral-worker.shahadathakhand7.workers.dev/api/register',
  REFERRAL_COUNT_URL: 'https://tma-referral-worker.shahadathakhand7.workers.dev/api/daily-referral-count',
  SOCIAL_LINKS: {
    youtube: 'https://www.youtube.com/@Censorcoin_TMA',
    tiktok: 'https://vm.tiktok.com/ZS9L7T97eEGqG-E5kQ8/',
    facebook: 'https://www.facebook.com/share/1FsEJyrp6n/'
  },
  DAILY_TASKS: 6,
  DAILY_CLAIMS: 7,
  TASK_REWARD: 5000,
  CLAIM_REWARD: 3000,
  SOCIAL_REWARD: 10000,
  MONETAG_ZONE: '10883491',
  ONCLOCKA_SPOT: '6116695',
  CLAIM_PREFIXES: ['S9t', 'RSt', 'J9r', 'K4m', 'L7p', 'Q2w', 'Z8x', 'P3n', 'T6v', 'X1m'],
  LOTTIE_COIN_URL: 'https://assets9.lottiefiles.com/packages/lf20_qm8eqzse.json',
  LOTTIE_REWARD_URL: 'https://assets7.lottiefiles.com/packages/lf20_kcsr6fcp.json',
  PICSUM_BASE: 'https://picsum.photos/seed/',
  TON_COOLDOWN_DAYS: 14
};

// ── DEFAULT USER DATA ──────────────────────────────
var DEFAULT_USER = {
  membership_verified: false,
  reg_status: 'unregistered',
  referral_code: '',
  username: '',
  first_name: '',
  profile_photo_url: null,
  total_points: 0,
  total_refers: 0,
  today_tasks_completed: 0,
  claim_codes_used: [],
  youtube_completed: false,
  tiktok_completed: false,
  facebook_completed: false,
  last_referral_check_date: '',
  ton_address: '',
  last_ton_address_change: '',
  language: 'en',
  schema_version: 1,
  last_reset_date: ''
};

// ── APP STATE ──────────────────────────────────────
var State = {
  user: null,
  currentPage: 'home',
  telegramUser: null,
  taskImages: [],
  taskReviews: {},
  currentTaskIndex: 0,
  socialTimerInterval: null,
  socialTimerSeconds: 120,
  socialPlatform: null,
  socialLinkOpened: false,
  rewardLottie: null,
  homeLottie: null,
  isVerifying: false,
  initialized: false
};

// ── TRANSLATIONS ───────────────────────────────────
var LANG = {
  en: {
    appName:'Censor Coin',home:'Home',earn:'Earn',profile:'Profile',
    totalPoints:'Total Points',totalRefers:'Total Refers',tasksToday:'Tasks Today',claimsToday:'Claims Today',
    dailyCensoring:'Daily Censoring',censorClaim:'Censor Claim',socialTasks:'Social Tasks',
    joinChannel:'Join @censorcoin to start earning',join:'Join Channel',verify:'Verify Membership',
    verified:'Verified',submit:'Submit Review',violent:'Violent/Adult?',clearHD:'Clear HD?',
    reward:'Reward',coins:'COINS',claimed:'Claimed',claimCode:'Censor Claim',
    enterCode:'Enter code',claimReward:'Claim Reward',
    invalidCode:'Invalid or already used code',successClaim:'Claimed! +3,000 coins',
    successTask:'Task complete! +5,000 coins',successSocial:'Complete! +10,000 coins',
    completed:'Completed',pending:'Pending',
    referralLink:'Referral Link',copyLink:'Copy',copied:'Copied!',
    tonAddress:'TON Address',editAddress:'Edit Address',save:'Save',cancel:'Cancel',
    language:'Language',tutorial:'Tutorial',privacy:'Privacy Policy',terms:'Terms of Service',
    coinsEarned:'Coins Earned',referrals:'Referrals',
    addressCooldown:'Address can only be changed once every 14 days',
    invalidAddress:'Invalid TON address format (must start with EQ or UQ)',
    loadingReward:'Watching ad…',maxClaims:'All 7 claims used for today',
    maxTasks:'All 6 tasks done for today',claimProgress:'claimed today',
    viewTutorial:'Watch Tutorial',youtube:'YouTube',tiktok:'TikTok',facebook:'Facebook',
    watchAndEarn:'Watch & Earn',openLink:'Open Link',claimAfterTimer:'Claim (2 min wait)',
    registration:'Setting up your account…',welcome:'Welcome to Censor Coin!',
    loading:'Loading…',error:'Something went wrong',retry:'Retry',
    afterJoin:'After joining, tap Verify',goodDay:'Good day',goodMorning:'Good morning',
    goodAfternoon:'Good afternoon',goodEvening:'Good evening',
    notSet:'Not set',refers:'refers',censorTask:'Censoring Task',
    claimedToday:'claimed today',perDay:'per day',
  },
  bn: {
    appName:'সেন্সর কয়েন',home:'হোম',earn:'আয়',profile:'প্রোফাইল',
    totalPoints:'মোট পয়েন্ট',totalRefers:'মোট রেফার',tasksToday:'আজকের টাস্ক',claimsToday:'আজকের ক্লেইম',
    dailyCensoring:'দৈনিক সেন্সরিং',censorClaim:'সেন্সর ক্লেইম',socialTasks:'সোশ্যাল টাস্ক',
    joinChannel:'@censorcoin চ্যানেলে যোগ দিন',join:'চ্যানেলে যোগ দিন',verify:'যাচাই করুন',
    verified:'যাচাই হয়েছে',submit:'জমা দিন',violent:'সহিংস/প্রাপ্তবয়স্ক?',clearHD:'পরিষ্কার HD?',
    reward:'পুরস্কার',coins:'কয়েন',claimed:'দাবি করা হয়েছে',claimCode:'সেন্সর ক্লেইম',
    enterCode:'কোড লিখুন',claimReward:'পুরস্কার দাবি করুন',
    invalidCode:'অবৈধ বা ব্যবহৃত কোড',successClaim:'দাবি করা হয়েছে! +৩,০০০ কয়েন',
    successTask:'টাস্ক সম্পন্ন! +৫,০০০ কয়েন',successSocial:'সম্পন্ন! +১০,০০০ কয়েন',
    completed:'সম্পন্ন',pending:'অপেক্ষমান',
    referralLink:'রেফারেল লিঙ্ক',copyLink:'কপি',copied:'কপি হয়েছে!',
    tonAddress:'TON ঠিকানা',editAddress:'সম্পাদনা করুন',save:'সংরক্ষণ করুন',cancel:'বাতিল',
    language:'ভাষা',tutorial:'টিউটোরিয়াল',privacy:'গোপনীয়তা নীতি',terms:'সেবার শর্ত',
    coinsEarned:'অর্জিত কয়েন',referrals:'রেফারেল',
    addressCooldown:'ঠিকানা ১৪ দিনে একবার পরিবর্তন করা যাবে',
    invalidAddress:'অবৈধ TON ঠিকানা (EQ বা UQ দিয়ে শুরু হওয়া উচিত)',
    loadingReward:'বিজ্ঞাপন দেখা হচ্ছে…',maxClaims:'আজকের ৭টি ক্লেইম শেষ',
    maxTasks:'আজকের ৬টি টাস্ক সম্পন্ন',claimProgress:'আজ দাবি করা হয়েছে',
    viewTutorial:'টিউটোরিয়াল দেখুন',youtube:'ইউটিউব',tiktok:'টিকটক',facebook:'ফেসবুক',
    watchAndEarn:'দেখুন ও আয় করুন',openLink:'লিঙ্ক খুলুন',claimAfterTimer:'ক্লেইম করুন',
    registration:'আপনার অ্যাকাউন্ট তৈরি হচ্ছে…',welcome:'সেন্সর কয়েনে স্বাগতম!',
    loading:'লোড হচ্ছে…',error:'কিছু ভুল হয়েছে',retry:'আবার চেষ্টা',
    afterJoin:'যোগ দিয়ে যাচাই করুন',goodDay:'শুভ দিন',goodMorning:'শুভ সকাল',
    goodAfternoon:'শুভ অপরাহ্ন',goodEvening:'শুভ সন্ধ্যা',
    notSet:'সেট নেই',refers:'রেফার',censorTask:'সেন্সরিং টাস্ক',
    claimedToday:'আজ দাবি করা হয়েছে',perDay:'প্রতিদিন',
  },
  hi: {
    appName:'सेंसर कॉइन',home:'होम',earn:'कमाएं',profile:'प्रोफाइल',
    totalPoints:'कुल अंक',totalRefers:'कुल रेफरल',tasksToday:'आज के कार्य',claimsToday:'आज के दावे',
    dailyCensoring:'दैनिक सेंसरिंग',censorClaim:'सेंसर दावा',socialTasks:'सोशल कार्य',
    joinChannel:'@censorcoin से जुड़ें',join:'चैनल जॉइन करें',verify:'सत्यापित करें',
    verified:'सत्यापित',submit:'जमा करें',violent:'हिंसक/वयस्क?',clearHD:'स्पष्ट HD?',
    reward:'पुरस्कार',coins:'सिक्के',claimed:'दावा किया',claimCode:'सेंसर दावा',
    enterCode:'कोड दर्ज करें',claimReward:'पुरस्कार प्राप्त करें',
    invalidCode:'अमान्य या उपयोग किया गया कोड',successClaim:'दावा किया! +3,000 सिक्के',
    successTask:'कार्य पूर्ण! +5,000 सिक्के',successSocial:'पूर्ण! +10,000 सिक्के',
    completed:'पूर्ण',pending:'लंबित',
    referralLink:'रेफरल लिंक',copyLink:'कॉपी',copied:'कॉपी हो गया!',
    tonAddress:'TON पता',editAddress:'पता बदलें',save:'सहेजें',cancel:'रद्द करें',
    language:'भाषा',tutorial:'ट्यूटोरियल',privacy:'गोपनीयता नीति',terms:'सेवा की शर्तें',
    coinsEarned:'अर्जित सिक्के',referrals:'रेफरल',
    addressCooldown:'पता 14 दिनों में एक बार बदला जा सकता है',
    invalidAddress:'अमान्य TON पता (EQ या UQ से शुरू होना चाहिए)',
    loadingReward:'विज्ञापन देख रहे हैं…',maxClaims:'आज के सभी 7 दावे पूर्ण',
    maxTasks:'आज के सभी 6 कार्य पूर्ण',claimProgress:'आज दावा किया',
    viewTutorial:'ट्यूटोरियल देखें',youtube:'यूट्यूब',tiktok:'टिकटॉक',facebook:'फेसबुक',
    watchAndEarn:'देखें और कमाएं',openLink:'लिंक खोलें',claimAfterTimer:'दावा करें',
    registration:'आपका खाता बना रहे हैं…',welcome:'सेंसर कॉइन में आपका स्वागत है!',
    loading:'लोड हो रहा है…',error:'कुछ गलत हो गया',retry:'पुनः प्रयास',
    afterJoin:'जॉइन करने के बाद सत्यापित करें',goodDay:'शुभ दिन',goodMorning:'शुभ प्रभात',
    goodAfternoon:'शुभ अपराह्न',goodEvening:'शुभ संध्या',
    notSet:'सेट नहीं',refers:'रेफरल',censorTask:'सेंसरिंग कार्य',
    claimedToday:'आज दावा किया',perDay:'प्रति दिन',
  },
  es: {
    appName:'Censor Coin',home:'Inicio',earn:'Ganar',profile:'Perfil',
    totalPoints:'Puntos Totales',totalRefers:'Total Referencias',tasksToday:'Tareas Hoy',claimsToday:'Reclamos Hoy',
    dailyCensoring:'Censura Diaria',censorClaim:'Reclamo Censor',socialTasks:'Tareas Sociales',
    joinChannel:'Únete a @censorcoin',join:'Unirse al Canal',verify:'Verificar',
    verified:'Verificado',submit:'Enviar Revisión',violent:'¿Violento/Adulto?',clearHD:'¿Claro HD?',
    reward:'Recompensa',coins:'Monedas',claimed:'Reclamado',claimCode:'Reclamo Censor',
    enterCode:'Ingresa código',claimReward:'Reclamar Recompensa',
    invalidCode:'Código inválido o ya usado',successClaim:'¡Reclamado! +3,000 monedas',
    successTask:'¡Tarea completa! +5,000 monedas',successSocial:'¡Completo! +10,000 monedas',
    completed:'Completado',pending:'Pendiente',
    referralLink:'Enlace de Referencia',copyLink:'Copiar',copied:'¡Copiado!',
    tonAddress:'Dirección TON',editAddress:'Editar',save:'Guardar',cancel:'Cancelar',
    language:'Idioma',tutorial:'Tutorial',privacy:'Privacidad',terms:'Términos',
    coinsEarned:'Monedas Ganadas',referrals:'Referencias',
    addressCooldown:'La dirección se puede cambiar cada 14 días',
    invalidAddress:'Formato de TON inválido (debe comenzar con EQ o UQ)',
    loadingReward:'Viendo anuncio…',maxClaims:'Máximo de reclamos alcanzado hoy',
    maxTasks:'Todas las tareas completadas hoy',claimProgress:'reclamado hoy',
    viewTutorial:'Ver Tutorial',youtube:'YouTube',tiktok:'TikTok',facebook:'Facebook',
    watchAndEarn:'Ver y Ganar',openLink:'Abrir Enlace',claimAfterTimer:'Reclamar',
    registration:'Configurando tu cuenta…',welcome:'¡Bienvenido a Censor Coin!',
    loading:'Cargando…',error:'Algo salió mal',retry:'Reintentar',
    afterJoin:'Después de unirte, toca Verificar',goodDay:'Buen día',goodMorning:'Buenos días',
    goodAfternoon:'Buenas tardes',goodEvening:'Buenas noches',
    notSet:'No configurado',refers:'referencias',censorTask:'Tarea de Censura',
    claimedToday:'reclamado hoy',perDay:'por día',
  },
  ar: {
    appName:'سنسور كوين',home:'الرئيسية',earn:'اكسب',profile:'الملف',
    totalPoints:'إجمالي النقاط',totalRefers:'إجمالي الإحالات',tasksToday:'مهام اليوم',claimsToday:'مطالبات اليوم',
    dailyCensoring:'الرقابة اليومية',censorClaim:'مطالبة الرقابة',socialTasks:'المهام الاجتماعية',
    joinChannel:'انضم إلى @censorcoin',join:'انضم للقناة',verify:'تحقق',
    verified:'تم التحقق',submit:'إرسال',violent:'عنيف/بالغ؟',clearHD:'واضح HD؟',
    reward:'مكافأة',coins:'عملات',claimed:'تمت المطالبة',claimCode:'مطالبة الرقابة',
    enterCode:'أدخل الرمز',claimReward:'المطالبة بالمكافأة',
    invalidCode:'رمز غير صالح أو مستخدم',successClaim:'تمت المطالبة! +3,000 عملة',
    successTask:'اكتملت المهمة! +5,000 عملة',successSocial:'مكتمل! +10,000 عملة',
    completed:'مكتمل',pending:'قيد الانتظار',
    referralLink:'رابط الإحالة',copyLink:'نسخ',copied:'تم النسخ!',
    tonAddress:'عنوان TON',editAddress:'تعديل',save:'حفظ',cancel:'إلغاء',
    language:'اللغة',tutorial:'البرنامج التعليمي',privacy:'الخصوصية',terms:'الشروط',
    coinsEarned:'العملات المكتسبة',referrals:'الإحالات',
    addressCooldown:'يمكن تغيير العنوان مرة كل 14 يوماً',
    invalidAddress:'عنوان TON غير صالح (يجب أن يبدأ بـ EQ أو UQ)',
    loadingReward:'مشاهدة الإعلان…',maxClaims:'تم الوصول للحد الأقصى اليوم',
    maxTasks:'اكتملت جميع المهام اليوم',claimProgress:'تمت المطالبة اليوم',
    viewTutorial:'مشاهدة البرنامج التعليمي',youtube:'يوتيوب',tiktok:'تيك توك',facebook:'فيسبوك',
    watchAndEarn:'شاهد واكسب',openLink:'فتح الرابط',claimAfterTimer:'المطالبة',
    registration:'جارٍ إعداد حسابك…',welcome:'مرحباً بك في سنسور كوين!',
    loading:'جارٍ التحميل…',error:'حدث خطأ ما',retry:'إعادة المحاولة',
    afterJoin:'بعد الانضمام، اضغط تحقق',goodDay:'يوم طيب',goodMorning:'صباح الخير',
    goodAfternoon:'مساء الخير',goodEvening:'مساء النور',
    notSet:'غير محدد',refers:'إحالات',censorTask:'مهمة الرقابة',
    claimedToday:'تمت المطالبة اليوم',perDay:'في اليوم',
  },
  de: {
    appName:'Censor Coin',home:'Startseite',earn:'Verdienen',profile:'Profil',
    totalPoints:'Gesamtpunkte',totalRefers:'Gesamtreferrals',tasksToday:'Aufgaben Heute',claimsToday:'Ansprüche Heute',
    dailyCensoring:'Tägliches Zensieren',censorClaim:'Zensor-Anspruch',socialTasks:'Soziale Aufgaben',
    joinChannel:'Tritt @censorcoin bei',join:'Kanal Beitreten',verify:'Verifizieren',
    verified:'Verifiziert',submit:'Bewertung Senden',violent:'Gewalttätig/Erwachsene?',clearHD:'Klar HD?',
    reward:'Belohnung',coins:'Münzen',claimed:'Beansprucht',claimCode:'Zensor-Anspruch',
    enterCode:'Code eingeben',claimReward:'Belohnung beanspruchen',
    invalidCode:'Ungültiger oder verwendeter Code',successClaim:'Beansprucht! +3.000 Münzen',
    successTask:'Aufgabe erledigt! +5.000 Münzen',successSocial:'Erledigt! +10.000 Münzen',
    completed:'Abgeschlossen',pending:'Ausstehend',
    referralLink:'Empfehlungslink',copyLink:'Kopieren',copied:'Kopiert!',
    tonAddress:'TON-Adresse',editAddress:'Bearbeiten',save:'Speichern',cancel:'Abbrechen',
    language:'Sprache',tutorial:'Tutorial',privacy:'Datenschutz',terms:'Nutzungsbedingungen',
    coinsEarned:'Verdiente Münzen',referrals:'Empfehlungen',
    addressCooldown:'Adresse kann alle 14 Tage geändert werden',
    invalidAddress:'Ungültiges TON-Format (muss mit EQ oder UQ beginnen)',
    loadingReward:'Werbung wird angesehen…',maxClaims:'Maximale Ansprüche heute erreicht',
    maxTasks:'Alle Aufgaben heute erledigt',claimProgress:'heute beansprucht',
    viewTutorial:'Tutorial Ansehen',youtube:'YouTube',tiktok:'TikTok',facebook:'Facebook',
    watchAndEarn:'Ansehen & Verdienen',openLink:'Link Öffnen',claimAfterTimer:'Beanspruchen',
    registration:'Konto wird eingerichtet…',welcome:'Willkommen bei Censor Coin!',
    loading:'Lädt…',error:'Etwas ist schiefgelaufen',retry:'Wiederholen',
    afterJoin:'Nach dem Beitreten verifizieren',goodDay:'Guten Tag',goodMorning:'Guten Morgen',
    goodAfternoon:'Guten Nachmittag',goodEvening:'Guten Abend',
    notSet:'Nicht gesetzt',refers:'Empfehlungen',censorTask:'Zensier-Aufgabe',
    claimedToday:'heute beansprucht',perDay:'pro Tag',
  }
};

function t(key) {
  var lang = (State.user && State.user.language) || 'en';
  return (LANG[lang] && LANG[lang][key]) || LANG['en'][key] || key;
}

// ── SOUND ──────────────────────────────────────────
var sounds = {};

function initSounds() {
  try {
    sounds.click = new Howl({ src: ['assets/click.mp3'], volume: 0.4, preload: true });
    sounds.coin  = new Howl({ src: ['assets/coin.mp3'],  volume: 0.7, preload: true });
  } catch(e) {
    console.log('Sound init error:', e);
  }
}

function playClick() { try { if (sounds.click) sounds.click.play(); } catch(e) {} }
function playCoin()  { try { if (sounds.coin)  sounds.coin.play();  } catch(e) {} }

// ── CLOUDstorage WRAPPER ──────────────────────────
function csSet(key, value) {
  return new Promise(function(resolve, reject) {
    var str = JSON.stringify(value);
    if (new Blob([str]).size > 4096) {
      if (value && Array.isArray(value.claim_codes_used)) {
        value.claim_codes_used = value.claim_codes_used.slice(-15);
        str = JSON.stringify(value);
      }
    }
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
      window.Telegram.WebApp.CloudStorage.setItem(key, str, function(err) {
        if (err) { localStorage.setItem(key, str); resolve(); }
        else resolve();
      });
    } else {
      localStorage.setItem(key, str);
      resolve();
    }
  });
}

function csGet(key) {
  return new Promise(function(resolve) {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
      window.Telegram.WebApp.CloudStorage.getItem(key, function(err, val) {
        if (err || !val) resolve(null);
        else resolve(val);
      });
    } else {
      resolve(localStorage.getItem(key));
    }
  });
}

// ── DATE UTILITIES ─────────────────────────────────
function getBangladeshDate() {
  var now = new Date();
  var opts = { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' };
  var parts = new Intl.DateTimeFormat('en-GB', opts).formatToParts(now);
  var y = '', m = '', d = '';
  parts.forEach(function(p) {
    if (p.type === 'year') y = p.value;
    else if (p.type === 'month') m = p.value;
    else if (p.type === 'day') d = p.value;
  });
  return y + m + d; // YYYYMMDD
}

function getBangladeshDateFormatted() {
  var now = new Date();
  var opts = { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' };
  var parts = new Intl.DateTimeFormat('en-GB', opts).formatToParts(now);
  var y = '', m = '', d = '';
  parts.forEach(function(p) {
    if (p.type === 'year') y = p.value;
    else if (p.type === 'month') m = p.value;
    else if (p.type === 'day') d = p.value;
  });
  return y + '-' + m + '-' + d; // YYYY-MM-DD for storage
}

function getBangladeshHour() {
  var now = new Date();
  return parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', hour12: false }).format(now));
}

function getGreeting() {
  var h = getBangladeshHour();
  if (h >= 5 && h < 12) return t('goodMorning');
  if (h >= 12 && h < 17) return t('goodAfternoon');
  if (h >= 17 && h < 21) return t('goodEvening');
  return t('goodDay');
}

function formatPoints(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function maskAddress(addr) {
  if (!addr) return '';
  if (addr.length <= 10) return addr;
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

// ── STORAGE ────────────────────────────────────────
async function loadUser() {
  try {
    var raw = await csGet(CONFIG.STORAGE_KEY);
    if (!raw) return Object.assign({}, DEFAULT_USER);
    var data = Object.assign({}, DEFAULT_USER, JSON.parse(raw));
    var today = getBangladeshDateFormatted();
    if (data.last_reset_date !== today) {
      data.today_tasks_completed = 0;
      data.claim_codes_used = [];
      data.last_reset_date = today;
    }
    return data;
  } catch(e) {
    return Object.assign({}, DEFAULT_USER);
  }
}

async function saveUser(data) {
  await csSet(CONFIG.STORAGE_KEY, data);
}

async function updateUser(updates) {
  var user = Object.assign({}, State.user, updates);
  State.user = user;
  await saveUser(user);
  return user;
}

// ── API CALLS ──────────────────────────────────────
async function apiVerify(userId) {
  try {
    var res = await fetch(CONFIG.VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, channel_username: CONFIG.CHANNEL_USERNAME })
    });
    if (!res.ok) return false;
    var data = await res.json();
    return data.is_member === true || data.member === true || data.isMember === true;
  } catch(e) { return false; }
}

async function apiRegister(params) {
  try {
    var res = await fetch(CONFIG.REGISTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) return { success: false };
    var data = await res.json();
    return { success: true, referral_code: data.referral_code || data.referralCode || '' };
  } catch(e) { return { success: false }; }
}

async function apiFetchReferralCount(telegramId) {
  try {
    var res = await fetch(CONFIG.REFERRAL_COUNT_URL + '?telegram_id=' + telegramId);
    if (!res.ok) return 0;
    var data = await res.json();
    return data.count || data.total || data.referral_count || 0;
  } catch(e) { return 0; }
}

// ── AD INTEGRATIONS ────────────────────────────────
function initOnClickA() {
  if (window.initCdTma) {
    window.initCdTma({ id: CONFIG.ONCLOCKA_SPOT })
      .then(function(show) { window.showAd = show; })
      .catch(function(e) { console.log('OnClickA init error:', e); });
  }
}

function showMonetagInterstitial() {
  return new Promise(function(resolve) {
    if (typeof window.show_10883491 === 'function') {
      window.show_10883491()
        .then(function() { resolve(true); })
        .catch(function() { resolve(false); });
    } else {
      setTimeout(function() { resolve(false); }, 500);
    }
  });
}

function showMonetagPop() {
  return new Promise(function(resolve) {
    if (typeof window.show_10883491 === 'function') {
      window.show_10883491('pop')
        .then(function() { resolve(true); })
        .catch(function() { resolve(false); });
    } else {
      setTimeout(function() { resolve(false); }, 500);
    }
  });
}

function showOnClickAd() {
  return new Promise(function(resolve) {
    if (typeof window.showAd === 'function') {
      window.showAd()
        .then(function() { resolve(true); })
        .catch(function() { resolve(false); });
    } else {
      setTimeout(function() { resolve(false); }, 500);
    }
  });
}

// ── LOTTIE ANIMATIONS ──────────────────────────────
function initHomeLottie() {
  var el = document.getElementById('home-lottie');
  if (!el || !window.lottie) return;
  if (State.homeLottie) { State.homeLottie.destroy(); State.homeLottie = null; }
  State.homeLottie = lottie.loadAnimation({
    container: el,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: CONFIG.LOTTIE_COIN_URL
  });
}

function showRewardAnimation(amount) {
  var overlay = document.getElementById('reward-overlay');
  var amountEl = document.getElementById('reward-amount-text');
  var labelEl = document.getElementById('reward-label-text');
  var lottieEl = document.getElementById('reward-lottie');

  if (amountEl) amountEl.textContent = '+' + amount.toLocaleString();
  if (labelEl) labelEl.textContent = 'COINS EARNED';

  if (lottieEl && window.lottie) {
    if (State.rewardLottie) { State.rewardLottie.destroy(); State.rewardLottie = null; }
    State.rewardLottie = lottie.loadAnimation({
      container: lottieEl,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: CONFIG.LOTTIE_REWARD_URL
    });
  }

  overlay.classList.remove('hidden');
  setTimeout(function() { overlay.classList.add('hidden'); }, 2200);
}

// ── CLAIM CODE VALIDATION ──────────────────────────
// Format: {prefix}{YYYYMMDD}{N}  e.g. S9t202604191
function validateClaimCode(code) {
  if (!code || code.length < 12) return { valid: false };

  var prefix = null;
  var rest = code;

  for (var i = 0; i < CONFIG.CLAIM_PREFIXES.length; i++) {
    var p = CONFIG.CLAIM_PREFIXES[i];
    if (code.startsWith(p)) {
      prefix = p;
      rest = code.slice(p.length);
      break;
    }
  }

  if (!prefix) return { valid: false };

  // rest should be YYYYMMDD + N (9 or 10 chars total)
  if (rest.length < 9) return { valid: false };

  var datePart = rest.slice(0, 8);   // YYYYMMDD
  var numPart  = rest.slice(8);      // 1-7

  // Validate date
  var todayDate = getBangladeshDate(); // YYYYMMDD
  if (datePart !== todayDate) return { valid: false };

  // Validate claim number
  var claimNum = parseInt(numPart, 10);
  if (isNaN(claimNum) || claimNum < 1 || claimNum > 7) return { valid: false };

  // Check if already used
  var usedKey = 'v' + claimNum;
  if (State.user.claim_codes_used.indexOf(usedKey) !== -1) return { valid: false };

  return { valid: true, claimNum: claimNum, usedKey: usedKey };
}

// ── VERIFY / REGISTER FLOW ─────────────────────────
var verifyAttempts = 0;

async function handleJoinChannel() {
  playClick();
  openLinkInApp(CONFIG.CHANNEL_LINK);
}

async function handleVerify() {
  if (State.isVerifying) return;
  playClick();
  State.isVerifying = true;

  var btn = document.getElementById('verify-btn');
  var txt = document.getElementById('verify-btn-text');
  if (btn) btn.disabled = true;
  if (txt) txt.textContent = '…';

  var userId = State.telegramUser ? State.telegramUser.id : 0;

  // If no real Telegram user, allow in dev mode
  var isMember = userId ? await apiVerify(userId) : true;

  if (!isMember) {
    State.isVerifying = false;
    if (btn) btn.disabled = false;
    if (txt) txt.textContent = t('verify');
    verifyAttempts++;
    if (verifyAttempts >= 2) {
      var hint = document.getElementById('verify-hint-text');
      if (hint) hint.style.color = '#EF4444';
    }
    return;
  }

  // Verified — register if needed
  await updateUser({ membership_verified: true });
  hideEl('verify-modal');

  if (State.user.reg_status === 'unregistered') {
    await registerUser();
  } else {
    showApp();
  }
}

async function registerUser() {
  showEl('reg-overlay');
  var regText = document.getElementById('reg-text');
  if (regText) regText.textContent = t('registration');

  var tgUser = State.telegramUser;
  var startParam = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.start_param) || '';

  var params = {
    telegram_id: tgUser ? tgUser.id : 0,
    username: (tgUser && tgUser.username) ? tgUser.username : 'user',
    first_name: (tgUser && tgUser.first_name) ? tgUser.first_name : 'User',
    referral_code_used: startParam || ''
  };

  var result = await apiRegister(params);

  var refCode = result.referral_code;
  if (!refCode) {
    // Generate locally if API doesn't provide
    refCode = generateLocalReferralCode(tgUser ? tgUser.id : Math.floor(Math.random() * 99999));
  }

  await updateUser({
    reg_status: 'registered',
    referral_code: refCode,
    username: params.username,
    first_name: params.first_name,
    profile_photo_url: (tgUser && tgUser.photo_url) ? tgUser.photo_url : null,
    last_reset_date: getBangladeshDateFormatted()
  });

  hideEl('reg-overlay');
  showApp();
}

function generateLocalReferralCode(userId) {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var code = '';
  var seed = userId;
  for (var i = 0; i < 8; i++) {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    code += chars[seed % chars.length];
  }
  return code;
}

// ── PAGE NAVIGATION ────────────────────────────────
function switchPage(page) {
  playClick();
  State.currentPage = page;

  var pages = ['home', 'earn', 'profile'];
  pages.forEach(function(p) {
    var el = document.getElementById('page-' + p);
    var nav = document.getElementById('nav-' + p);
    if (el) {
      if (p === page) { el.classList.add('active-page'); el.classList.remove('hidden'); }
      else { el.classList.remove('active-page'); }
    }
    if (nav) {
      if (p === page) nav.classList.add('active');
      else nav.classList.remove('active');
    }
  });

  if (page === 'home') renderHome();
  else if (page === 'earn') renderEarn();
  else if (page === 'profile') renderProfile();

  // Apply RTL for Arabic
  var lang = (State.user && State.user.language) || 'en';
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);
}

// ── RENDER HOME ────────────────────────────────────
function renderHome() {
  var u = State.user;
  if (!u) return;

  setText('home-greeting', getGreeting() + (u.first_name ? ', ' + u.first_name + '!' : '!'));
  setText('home-username', u.username ? '@' + u.username : '');
  setText('total-points-label', t('totalPoints'));

  var pointsEl = document.getElementById('total-points-value');
  if (pointsEl) {
    pointsEl.textContent = formatPoints(u.total_points);
  }

  setText('stat-refers', u.total_refers);
  setText('stat-tasks', u.today_tasks_completed + '/6');
  setText('stat-claims', u.claim_codes_used.length + '/7');
  setText('stat-refers-label', t('totalRefers'));
  setText('stat-tasks-label', t('tasksToday'));
  setText('stat-claims-label', t('claimsToday'));

  // Nav labels
  setText('nav-home-label', t('home'));
  setText('nav-earn-label', t('earn'));
  setText('nav-profile-label', t('profile'));

  // Init Lottie once
  if (!State.homeLottie) {
    setTimeout(initHomeLottie, 300);
  }
}

// ── RENDER EARN ────────────────────────────────────
var TASK_ILLUS = [
  // SVG mini illustrations for task cards (unDraw-style)
  '<svg viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg"><rect width="46" height="46" rx="10" fill="#1e2a3a"/><rect x="8" y="14" width="30" height="20" rx="3" fill="#2a3f5c"/><rect x="11" y="17" width="12" height="8" rx="2" fill="#4a90d9"/><circle cx="30" cy="21" r="5" fill="#FFD700" opacity="0.8"/><rect x="11" y="27" width="20" height="2" rx="1" fill="#3a5070" opacity="0.7"/></svg>',
  '<svg viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg"><rect width="46" height="46" rx="10" fill="#1e3a2a"/><circle cx="23" cy="20" r="8" fill="#22C55E" opacity="0.7"/><path d="M17 20l4 4 8-8" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="10" y="31" width="26" height="3" rx="1.5" fill="#22C55E" opacity="0.4"/></svg>',
  '<svg viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg"><rect width="46" height="46" rx="10" fill="#2a1e3a"/><polygon points="23,10 33,28 13,28" fill="#A78BFA" opacity="0.8"/><circle cx="23" cy="32" r="4" fill="#FFD700" opacity="0.7"/><rect x="10" y="36" width="26" height="2" rx="1" fill="#A78BFA" opacity="0.4"/></svg>',
  '<svg viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg"><rect width="46" height="46" rx="10" fill="#3a1e1e"/><circle cx="18" cy="22" r="7" fill="#EF4444" opacity="0.7"/><circle cx="30" cy="22" r="7" fill="#FFA500" opacity="0.7"/><rect x="10" y="33" width="26" height="2" rx="1" fill="#EF4444" opacity="0.4"/></svg>',
  '<svg viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg"><rect width="46" height="46" rx="10" fill="#1e2a1e"/><rect x="10" y="28" width="5" height="10" rx="2" fill="#22C55E" opacity="0.7"/><rect x="17" y="22" width="5" height="16" rx="2" fill="#4a90d9" opacity="0.7"/><rect x="24" y="18" width="5" height="20" rx="2" fill="#FFD700" opacity="0.8"/><rect x="31" y="24" width="5" height="14" rx="2" fill="#A78BFA" opacity="0.7"/></svg>',
  '<svg viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg"><rect width="46" height="46" rx="10" fill="#2a2a1e"/><circle cx="23" cy="18" r="8" fill="#2AABEE" opacity="0.7"/><path d="M15 30 Q23 24 31 30" stroke="#FFD700" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="23" cy="38" r="3" fill="#FFA500" opacity="0.7"/></svg>'
];

var SOCIAL_TASKS_DATA = [
  { key: 'youtube',  icon: '<i class="ph-fill ph-youtube-logo"></i>', cls: 'yt',  label: 'YouTube', link: CONFIG.SOCIAL_LINKS.youtube },
  { key: 'tiktok',   icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.94a8.18 8.18 0 004.78 1.52V7.02a4.85 4.85 0 01-1.01-.33z"/></svg>', cls: 'tt', label: 'TikTok', link: CONFIG.SOCIAL_LINKS.tiktok },
  { key: 'facebook', icon: '<i class="ph-fill ph-facebook-logo"></i>', cls: 'fb', label: 'Facebook', link: CONFIG.SOCIAL_LINKS.facebook }
];

function renderEarn() {
  var u = State.user;
  if (!u) return;

  setText('earn-title', t('earn'));
  setText('earn-sub', '');
  setText('daily-censor-label', t('dailyCensoring'));
  setText('censor-claim-label', t('censorClaim'));
  setText('social-tasks-label', t('socialTasks'));

  // Daily tasks
  var list = document.getElementById('daily-tasks-list');
  if (list) {
    list.innerHTML = '';
    for (var i = 0; i < CONFIG.DAILY_TASKS; i++) {
      var done = i < u.today_tasks_completed;
      var card = document.createElement('div');
      card.className = 'task-card' + (done ? ' task-done' : '');
      card.setAttribute('data-task-index', i);
      if (!done) card.addEventListener('click', (function(idx) { return function() { openTaskModal(idx); }; })(i));
      card.innerHTML =
        '<div class="task-card-img">' + TASK_ILLUS[i] + '</div>' +
        '<div class="task-card-info">' +
          '<div class="task-card-title">' + t('censorTask') + ' ' + (i + 1) + '</div>' +
          '<div class="task-card-sub">' + (done ? t('completed') : '+' + CONFIG.TASK_REWARD.toLocaleString() + ' ' + t('coins')) + '</div>' +
        '</div>' +
        (done
          ? '<div class="task-card-check"><i class="ph-bold ph-check"></i></div>'
          : '<div class="task-card-reward">+' + formatPoints(CONFIG.TASK_REWARD) + '</div>');
      list.appendChild(card);
    }
  }

  // Claim card
  var claimsUsed = u.claim_codes_used.length;
  var claimTitle = document.getElementById('claim-card-title');
  var claimSub   = document.getElementById('claim-card-sub');
  if (claimTitle) claimTitle.textContent = t('censorClaim');
  if (claimSub)   claimSub.textContent   = claimsUsed + '/' + CONFIG.DAILY_CLAIMS + ' ' + t('claimedToday');

  // Social tasks
  var sList = document.getElementById('social-tasks-list');
  if (sList) {
    sList.innerHTML = '';
    SOCIAL_TASKS_DATA.forEach(function(task) {
      var done = u[task.key + '_completed'];
      var card = document.createElement('div');
      card.className = 'social-task-card' + (done ? ' task-done' : '');
      if (!done) card.addEventListener('click', function() { openSocialModal(task); });
      card.innerHTML =
        '<div class="social-task-icon ' + task.cls + '">' + task.icon + '</div>' +
        '<div class="task-card-info">' +
          '<div class="task-card-title">' + task.label + '</div>' +
          '<div class="task-card-sub">' + (done ? t('completed') : '+' + CONFIG.SOCIAL_REWARD.toLocaleString() + ' ' + t('coins')) + '</div>' +
        '</div>' +
        (done
          ? '<div class="task-card-check"><i class="ph-bold ph-check"></i></div>'
          : '<div class="task-card-reward">+' + formatPoints(CONFIG.SOCIAL_REWARD) + '</div>');
      sList.appendChild(card);
    });
  }
}

// ── RENDER PROFILE ─────────────────────────────────
function renderProfile() {
  var u = State.user;
  if (!u) return;

  // Avatar
  var avatarEl = document.getElementById('profile-avatar');
  if (avatarEl) {
    if (u.profile_photo_url) {
      avatarEl.innerHTML = '<img src="' + u.profile_photo_url + '" alt="avatar" onerror="this.parentElement.innerHTML=\'<span>' + (u.first_name ? u.first_name[0].toUpperCase() : '?') + '</span>\'">';
    } else {
      avatarEl.innerHTML = '<span>' + (u.first_name ? u.first_name[0].toUpperCase() : '?') + '</span>';
    }
  }

  setText('profile-name', u.first_name || 'User');
  setText('profile-username-display', u.username ? '@' + u.username : '');
  setText('ton-label', t('tonAddress'));
  setText('ton-value', u.ton_address ? maskAddress(u.ton_address) : t('notSet'));
  setText('referral-label-txt', t('referralLink'));
  setText('lang-label', t('language'));
  setText('tutorial-label', t('viewTutorial'));
  setText('privacy-label', t('privacy'));
  setText('terms-label', t('terms'));

  // Referral link
  var refLink = CONFIG.BOT_LINK + '?start=' + (u.referral_code || '');
  setText('referral-link-display', refLink);
  setText('referral-count-val', u.total_refers + ' ' + t('refers'));
  setText('ref-total-refers', u.total_refers);
  setText('ref-coins-earned', formatPoints(u.total_refers * 500));
  setText('ref-label', t('referrals'));
  setText('ref-coins-label', t('coinsEarned'));
  setText('copy-btn-text', t('copyLink'));

  // Language buttons
  var langGrid = document.getElementById('lang-grid');
  if (langGrid) {
    var langs = [
      { code: 'en', label: '🇬🇧 EN' },
      { code: 'bn', label: '🇧🇩 BN' },
      { code: 'hi', label: '🇮🇳 HI' },
      { code: 'es', label: '🇪🇸 ES' },
      { code: 'ar', label: '🇸🇦 AR' },
      { code: 'de', label: '🇩🇪 DE' }
    ];
    langGrid.innerHTML = '';
    langs.forEach(function(l) {
      var btn = document.createElement('button');
      btn.className = 'lang-btn' + (u.language === l.code ? ' active' : '');
      btn.textContent = l.label;
      btn.addEventListener('click', function() { selectLanguage(l.code); });
      langGrid.appendChild(btn);
    });
  }

  // Fetch referral count once per day
  var today = getBangladeshDateFormatted();
  if (u.last_referral_check_date !== today && State.telegramUser) {
    apiFetchReferralCount(State.telegramUser.id).then(function(count) {
      if (count > 0) {
        updateUser({ total_refers: count, last_referral_check_date: today }).then(function() {
          setText('ref-total-refers', count);
          setText('referral-count-val', count + ' ' + t('refers'));
        });
      } else {
        updateUser({ last_referral_check_date: today });
      }
    });
  }
}

// ── LANGUAGE SELECTION ─────────────────────────────
function selectLanguage(lang) {
  playClick();
  updateUser({ language: lang }).then(function() {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    renderProfile();
    // Re-render current page labels
    renderHome();
    renderEarn();
  });
}

// ── COPY REFERRAL LINK ─────────────────────────────
function copyReferralLink() {
  playClick();
  var u = State.user;
  if (!u) return;
  var link = CONFIG.BOT_LINK + '?start=' + (u.referral_code || '');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link).then(function() { flashCopied(); }).catch(function() { fallbackCopy(link); });
  } else {
    fallbackCopy(link);
  }
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); } catch(e) {}
  document.body.removeChild(ta);
  flashCopied();
}

function flashCopied() {
  var btn = document.getElementById('copy-btn-text');
  if (btn) {
    btn.textContent = t('copied');
    setTimeout(function() { btn.textContent = t('copyLink'); }, 2000);
  }
}

// ── TASK MODAL ─────────────────────────────────────
function openTaskModal(taskIndex) {
  if (State.user.today_tasks_completed >= CONFIG.DAILY_TASKS) {
    alert(t('maxTasks'));
    return;
  }
  playClick();
  State.currentTaskIndex = taskIndex;
  State.taskReviews = {};

  // Generate 3 random picsum images with unique seeds
  var seeds = [
    'censor' + taskIndex + 'a' + Date.now(),
    'censor' + taskIndex + 'b' + Date.now(),
    'censor' + taskIndex + 'c' + Date.now()
  ];

  State.taskImages = seeds.map(function(s, i) {
    return 'https://picsum.photos/seed/' + encodeURIComponent(s) + '/300/300';
  });

  setText('task-modal-title', t('censorTask') + ' ' + (taskIndex + 1));

  var grid = document.getElementById('task-images-grid');
  if (grid) {
    grid.innerHTML = '';
    State.taskImages.forEach(function(src, i) {
      var img = document.createElement('img');
      img.src = src;
      img.className = 'task-img';
      img.alt = 'Image ' + (i + 1);
      img.loading = 'lazy';
      grid.appendChild(img);
    });
  }

  var reviews = document.getElementById('task-image-reviews');
  if (reviews) {
    reviews.innerHTML = '';
    State.taskImages.forEach(function(src, i) {
      var row = document.createElement('div');
      row.className = 'image-review-row';
      row.innerHTML =
        '<img src="' + src + '" class="image-review-thumb" alt="img ' + (i+1) + '">' +
        '<div class="image-review-btns">' +
          '<button class="review-btn" id="btn-violent-' + i + '" onclick="selectReview(' + i + ',\'violent\')">' + t('violent') + '</button>' +
          '<button class="review-btn" id="btn-clear-' + i + '" onclick="selectReview(' + i + ',\'clear\')">' + t('clearHD') + '</button>' +
        '</div>';
      reviews.appendChild(row);
    });
  }

  setText('task-submit-label', t('submit'));
  showEl('task-modal');
}

function selectReview(imgIndex, type) {
  playClick();
  State.taskReviews[imgIndex] = type;
  var vBtn = document.getElementById('btn-violent-' + imgIndex);
  var cBtn = document.getElementById('btn-clear-' + imgIndex);
  if (vBtn) vBtn.className = 'review-btn' + (type === 'violent' ? ' selected-violent' : '');
  if (cBtn) cBtn.className = 'review-btn' + (type === 'clear' ? ' selected-clear' : '');
}

async function submitTaskReview() {
  playClick();
  var btn = document.getElementById('task-submit-btn');
  if (btn) btn.disabled = true;

  var taskNum = State.user.today_tasks_completed + 1; // 1-indexed
  var isPopTask = (taskNum === 2 || taskNum === 4);

  setText('task-submit-label', t('loadingReward'));

  // Show appropriate Monetag ad
  var adShown = false;
  if (isPopTask) {
    adShown = await showMonetagPop();
  } else {
    adShown = await showMonetagInterstitial();
  }

  // Award coins regardless
  var newCount = State.user.today_tasks_completed + 1;
  var newPoints = State.user.total_points + CONFIG.TASK_REWARD;
  await updateUser({ today_tasks_completed: newCount, total_points: newPoints });

  hideEl('task-modal');
  playCoin();
  showRewardAnimation(CONFIG.TASK_REWARD);

  // Refresh earn page
  setTimeout(function() { renderEarn(); renderHome(); }, 300);
  if (btn) { btn.disabled = false; setText('task-submit-label', t('submit')); }
}

function closeTaskModal() {
  playClick();
  hideEl('task-modal');
  var btn = document.getElementById('task-submit-btn');
  if (btn) btn.disabled = false;
  setText('task-submit-label', t('submit'));
}

// ── CLAIM MODAL ────────────────────────────────────
function openClaimModal() {
  if (State.user.claim_codes_used.length >= CONFIG.DAILY_CLAIMS) {
    alert(t('maxClaims'));
    return;
  }
  playClick();

  var used = State.user.claim_codes_used.length;
  var fill = document.getElementById('claim-progress-fill');
  var label = document.getElementById('claim-progress-label');
  if (fill) fill.style.width = ((used / CONFIG.DAILY_CLAIMS) * 100) + '%';
  if (label) label.textContent = used + '/' + CONFIG.DAILY_CLAIMS + ' ' + t('claimedToday');

  setText('claim-modal-title', t('censorClaim'));
  setText('claim-submit-label', t('claimReward'));

  var input = document.getElementById('claim-code-input');
  if (input) { input.value = ''; input.placeholder = t('enterCode'); }

  var err = document.getElementById('claim-error-msg');
  if (err) err.textContent = '';

  showEl('claim-modal');
}

async function submitClaimCode() {
  playClick();
  var input = document.getElementById('claim-code-input');
  var err   = document.getElementById('claim-error-msg');
  var btn   = document.getElementById('claim-submit-btn');

  if (!input || !err || !btn) return;

  var code = input.value.trim();
  if (!code) {
    err.textContent = t('enterCode');
    return;
  }

  var result = validateClaimCode(code);
  if (!result.valid) {
    err.textContent = t('invalidCode');
    input.style.borderColor = 'var(--red)';
    setTimeout(function() { input.style.borderColor = ''; }, 1500);
    return;
  }

  err.textContent = '';
  btn.disabled = true;
  setText('claim-submit-label', t('loadingReward'));

  // Show OnClickA ad
  var adShown = await showOnClickAd();

  // Award coins
  var newCodes  = State.user.claim_codes_used.concat([result.usedKey]);
  var newPoints = State.user.total_points + CONFIG.CLAIM_REWARD;
  await updateUser({ claim_codes_used: newCodes, total_points: newPoints });

  // Update progress bar
  var used = newCodes.length;
  var fill  = document.getElementById('claim-progress-fill');
  var label = document.getElementById('claim-progress-label');
  if (fill) fill.style.width = ((used / CONFIG.DAILY_CLAIMS) * 100) + '%';
  if (label) label.textContent = used + '/' + CONFIG.DAILY_CLAIMS + ' ' + t('claimedToday');

  if (input) input.value = '';

  hideEl('claim-modal');
  playCoin();
  showRewardAnimation(CONFIG.CLAIM_REWARD);
  renderEarn();
  renderHome();

  btn.disabled = false;
  setText('claim-submit-label', t('claimReward'));
}

function closeClaimModal() {
  playClick();
  hideEl('claim-modal');
}

// ── SOCIAL TASK MODAL ──────────────────────────────
var currentSocialTask = null;

function openSocialModal(task) {
  playClick();
  currentSocialTask = task;
  State.socialLinkOpened = false;
  State.socialTimerSeconds = 120;

  if (State.socialTimerInterval) {
    clearInterval(State.socialTimerInterval);
    State.socialTimerInterval = null;
  }

  // Set icon
  var iconEl = document.getElementById('social-modal-icon');
  if (iconEl) iconEl.innerHTML = task.icon;

  setText('social-modal-title', task.label);
  setText('social-modal-desc', t('checkSocial'));
  setText('social-open-label', t('openLink'));
  setText('social-claim-label', t('claimAfterTimer'));

  var timerWrap = document.getElementById('social-timer-wrap');
  var claimBtn  = document.getElementById('social-claim-btn');
  var openBtn   = document.getElementById('social-open-btn');

  if (timerWrap) timerWrap.style.display = 'none';
  if (claimBtn)  claimBtn.style.display  = 'none';
  if (openBtn)   openBtn.style.display   = '';

  var circle = document.getElementById('timer-circle');
  var timerText = document.getElementById('timer-seconds');
  if (circle) circle.style.strokeDashoffset = '188.5';
  if (timerText) timerText.textContent = '120';

  showEl('social-modal');
}

function openSocialLink() {
  playClick();
  if (!currentSocialTask) return;

  openLinkInApp(currentSocialTask.link);
  State.socialLinkOpened = true;

  // Start timer
  var timerWrap = document.getElementById('social-timer-wrap');
  var openBtn   = document.getElementById('social-open-btn');
  if (timerWrap) timerWrap.style.display = 'flex';
  if (openBtn)   openBtn.style.display   = 'none';

  State.socialTimerSeconds = 120;
  var totalTime = 120;

  State.socialTimerInterval = setInterval(function() {
    State.socialTimerSeconds--;
    var remaining = State.socialTimerSeconds;
    var timerText = document.getElementById('timer-seconds');
    var circle    = document.getElementById('timer-circle');

    if (timerText) timerText.textContent = remaining;

    if (circle) {
      var progress = 1 - (remaining / totalTime);
      var offset = 188.5 - (188.5 * progress);
      circle.style.strokeDashoffset = offset;
    }

    if (remaining <= 0) {
      clearInterval(State.socialTimerInterval);
      State.socialTimerInterval = null;
      var claimBtn = document.getElementById('social-claim-btn');
      if (claimBtn) claimBtn.style.display = '';
      if (timerWrap) timerWrap.style.display = 'none';
    }
  }, 1000);
}

async function claimSocialReward() {
  if (!currentSocialTask || !State.socialLinkOpened) return;
  playClick();

  var btn = document.getElementById('social-claim-btn');
  if (btn) btn.disabled = true;

  var updates = {};
  updates[currentSocialTask.key + '_completed'] = true;
  updates.total_points = State.user.total_points + CONFIG.SOCIAL_REWARD;
  await updateUser(updates);

  hideEl('social-modal');
  playCoin();
  showRewardAnimation(CONFIG.SOCIAL_REWARD);
  renderEarn();
  renderHome();
  if (btn) btn.disabled = false;
}

function closeSocialModal() {
  playClick();
  if (State.socialTimerInterval) {
    clearInterval(State.socialTimerInterval);
    State.socialTimerInterval = null;
  }
  hideEl('social-modal');
}

// ── TON ADDRESS MODAL ──────────────────────────────
function openTonModal() {
  playClick();
  var u = State.user;
  if (!u) return;

  setText('ton-modal-title', t('tonAddress'));
  setText('ton-modal-desc', t('editAddress'));
  setText('ton-save-label', t('save'));

  var input = document.getElementById('ton-address-input');
  if (input) input.value = u.ton_address || '';

  var err = document.getElementById('ton-error-msg');
  if (err) err.textContent = '';

  var cooldownNote = document.getElementById('ton-cooldown-notice');
  var saveBtn = document.getElementById('ton-save-btn');

  // Check cooldown
  if (u.last_ton_address_change) {
    var lastChange = new Date(u.last_ton_address_change);
    var now = new Date();
    var daysDiff = (now - lastChange) / (1000 * 60 * 60 * 24);
    if (daysDiff < CONFIG.TON_COOLDOWN_DAYS) {
      var daysLeft = Math.ceil(CONFIG.TON_COOLDOWN_DAYS - daysDiff);
      if (cooldownNote) {
        cooldownNote.style.display = '';
        cooldownNote.textContent = t('addressCooldown') + ' (' + daysLeft + ' days left)';
      }
      if (saveBtn) saveBtn.disabled = true;
      if (input) input.disabled = true;
    } else {
      if (cooldownNote) cooldownNote.style.display = 'none';
      if (saveBtn) saveBtn.disabled = false;
      if (input) input.disabled = false;
    }
  } else {
    if (cooldownNote) cooldownNote.style.display = 'none';
    if (saveBtn) saveBtn.disabled = false;
    if (input) input.disabled = false;
  }

  showEl('ton-modal');
}

async function saveTonAddress() {
  playClick();
  var input = document.getElementById('ton-address-input');
  var err   = document.getElementById('ton-error-msg');

  if (!input || !err) return;

  var addr = input.value.trim();
  if (!addr) { err.textContent = t('invalidAddress'); return; }

  if (!validateTonAddress(addr)) {
    err.textContent = t('invalidAddress');
    return;
  }

  await updateUser({
    ton_address: addr,
    last_ton_address_change: new Date().toISOString()
  });

  hideEl('ton-modal');
  renderProfile();
}

function closeTonModal() {
  playClick();
  hideEl('ton-modal');
}

function validateTonAddress(addr) {
  return /^(EQ|UQ)[A-Za-z0-9_\-]{44,}$/.test(addr);
}

// ── TELEGRAM LINK OPENER ───────────────────────────
function openLinkInApp(url) {
  var webapp = window.Telegram && window.Telegram.WebApp;
  if (webapp && webapp.openTelegramLink && (url.startsWith('https://t.me') || url.startsWith('tg://'))) {
    webapp.openTelegramLink(url);
  } else if (webapp && webapp.openLink) {
    webapp.openLink(url);
  } else {
    window.open(url, '_blank');
  }
}

// ── DOM HELPERS ────────────────────────────────────
function setText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}

function showEl(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function hideEl(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

// ── SHOW APP ───────────────────────────────────────
function showApp() {
  hideEl('splash-screen');
  hideEl('verify-modal');
  hideEl('reg-overlay');
  showEl('app');

  State.initialized = true;
  switchPage('home');

  // Apply language direction
  var lang = (State.user && State.user.language) || 'en';
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);
}

// ── BROWSER PREVIEW (skip verification in non-Telegram browser) ──
function handleBrowserPreview() {
  State.user.membership_verified = true;
  State.user.reg_status = 'registered';
  State.user.first_name = 'Demo User';
  State.user.username = 'demo';
  State.user.total_points = 12500;
  State.user.total_refers = 2;
  State.user.referral_code = 'DEMO2024';
  State.user.language = State.user.language || 'en';
  hideEl('verify-modal');
  showApp();
}

// ── INITIALIZATION ─────────────────────────────────
async function init() {
  // Init sounds
  initSounds();

  // Init Telegram WebApp
  var webapp = window.Telegram && window.Telegram.WebApp;
  if (webapp) {
    webapp.ready();
    webapp.expand();
    webapp.enableClosingConfirmation();
    // Disable "View in Browser" / dev banner where possible
    if (webapp.isVersionAtLeast && webapp.isVersionAtLeast('6.1')) {
      // suppress dev banner
      try { webapp.enableClosingConfirmation(); } catch(e) {}
    }
    State.telegramUser = (webapp.initDataUnsafe && webapp.initDataUnsafe.user) || null;
  }

  // Init OnClickA
  initOnClickA();

  // Load user data
  State.user = await loadUser();

  // Pre-fill user info from Telegram if missing
  if (State.telegramUser && (!State.user.first_name || !State.user.username)) {
    State.user.first_name    = State.user.first_name    || State.telegramUser.first_name || '';
    State.user.username      = State.user.username      || State.telegramUser.username   || '';
    State.user.profile_photo_url = State.user.profile_photo_url || State.telegramUser.photo_url || null;
  }

  // Show splash for 2.5s then check verification
  setTimeout(async function() {
    if (State.user.membership_verified && State.user.reg_status === 'registered') {
      showApp();
    } else {
      // Show verification gate
      hideEl('splash-screen');

      // Populate verification modal text
      setText('verify-title', 'Join Our Channel');
      setText('verify-desc', t('joinChannel'));
      setText('join-btn-text', t('join'));
      setText('verify-btn-text', t('verify'));
      setText('verify-hint-text', t('afterJoin'));

      showEl('verify-modal');
      // In a regular browser (no Telegram context) show the preview bypass button
      if (!State.telegramUser) {
        showEl('browser-preview-btn');
      }
    }
  }, 2500);
}

// ── START ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  init();
});
