import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Play, YoutubeLogo, TiktokLogo, Tag, SealCheck } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useUser } from '../context/UserContext';
import { useMonetagAd } from '../components/MonetagAd';
import { formatDateCompact } from '../utils/date';
import useSound from 'use-sound';

const CLAIM_PREFIXES = ['S9t', 'RSt', 'J9r', 'Kp2', 'Lm5', 'Nx7', 'Qr1', 'Yt3', 'Wv6', 'Bz4',
  'Cf8', 'Dg9', 'Eh0', 'Fi2', 'Gj3', 'Hk4', 'Il5', 'Jm6', 'Kn7', 'Lo8',
  'Mp9', 'Nq0', 'Or1', 'Ps2', 'Qt3'];

const TASK_IMAGES = [
  'https://picsum.photos/400/600?random=1',
  'https://picsum.photos/400/600?random=2',
  'https://picsum.photos/400/600?random=3',
  'https://picsum.photos/400/600?random=4',
  'https://picsum.photos/400/600?random=5',
  'https://picsum.photos/400/600?random=6',
];

const TASK_ILLUSTRATIONS = [
  'https://cdn3d.iconscout.com/3d/premium/thumb/content-moderation-3d-icon-download-in-png-blend-fbx-gltf-file-formats--review-checking-check-digital-security-pack-network-communication-icons-6027888.png',
  'https://cdn3d.iconscout.com/3d/premium/thumb/video-review-3d-icon-download-in-png-blend-fbx-gltf-file-formats--play-film-analysis-pack-files-folders-icons-7601048.png',
  'https://cdn3d.iconscout.com/3d/premium/thumb/image-review-3d-icon-download-in-png-blend-fbx-gltf-file-formats--photo-check-picture-content-moderation-pack-files-folders-icons-7697869.png',
  'https://cdn3d.iconscout.com/3d/premium/thumb/rating-3d-icon-download-in-png-blend-fbx-gltf-file-formats--star-feedback-review-marketing-pack-icons-4665602.png',
  'https://cdn3d.iconscout.com/3d/premium/thumb/content-3d-icon-download-in-png-blend-fbx-gltf-file-formats--curation-digital-management-data-seo-pack-icons-9209555.png',
  'https://cdn3d.iconscout.com/3d/premium/thumb/verification-3d-icon-download-in-png-blend-fbx-gltf-file-formats--shield-security-check-protect-pack-network-communication-icons-5975588.png',
];

function RewardOverlay({ amount, onDone }: { amount: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.5 }}
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
    >
      <div className="bg-zinc-900/90 border-2 border-yellow-400 rounded-3xl px-12 py-8 flex flex-col items-center gap-3 shadow-2xl shadow-yellow-400/30">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: 2 }}
        >
          <img src="https://cdn-icons-png.flaticon.com/512/6941/6941697.png" alt="coin" className="w-16 h-16" />
        </motion.div>
        <p className="text-yellow-400 font-bold text-3xl">+{amount.toLocaleString()}</p>
        <p className="text-white text-lg font-semibold">Coins!</p>
      </div>
    </motion.div>
  );
}

export default function EarnPage() {
  const { t } = useTranslation();
  const { state, updateState } = useUser();
  const { showAd } = useMonetagAd();
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const [taskAnswer1, setTaskAnswer1] = useState<string | null>(null);
  const [taskAnswer2, setTaskAnswer2] = useState<string | null>(null);
  const [showClaim, setShowClaim] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [socialTimer, setSocialTimer] = useState<{ type: 'youtube' | 'tiktok'; seconds: number } | null>(null);
  const [reward, setReward] = useState<{ amount: number } | null>(null);
  const [adLoading, setAdLoading] = useState(false);
  const socialTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [playCoin] = useSound('https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-61905/zapsplat_multimedia_game_retro_coin_pickup_001.mp3', { volume: 0.5 });
  const [playClick] = useSound('https://www.sounddino.com/assets/mp3/button-click.mp3', { volume: 0.3 });

  if (!state) return null;

  const completedTasks = state.today_tasks_completed;
  const claimsUsed = state.claim_codes_used.length;

  const handleTaskClick = (index: number) => {
    if (completedTasks > index) return;
    playClick();
    setActiveTask(index);
    setTaskAnswer1(null);
    setTaskAnswer2(null);
  };

  const handleSubmitTask = async () => {
    if (!taskAnswer1 || !taskAnswer2 || activeTask === null) return;
    setAdLoading(true);
    try {
      const adType = activeTask < 3 ? 'pop' : 'interstitial';
      await showAd(adType);
      await updateState({
        total_points: state.total_points + 5000,
        today_tasks_completed: completedTasks + 1,
      });
      playCoin();
      setReward({ amount: 5000 });
      setActiveTask(null);
    } catch {
      // still reward
      await updateState({
        total_points: state.total_points + 5000,
        today_tasks_completed: completedTasks + 1,
      });
      setReward({ amount: 5000 });
      setActiveTask(null);
    } finally {
      setAdLoading(false);
    }
  };

  const validateClaimCode = (code: string): { valid: boolean; claimNum?: string; error?: string } => {
    const today = formatDateCompact();
    const parts = code.trim().split('-');
    if (parts.length !== 3) return { valid: false, error: t('earn.invalid_code') };
    const [prefix, date, vPart] = parts;
    if (!CLAIM_PREFIXES.includes(prefix)) return { valid: false, error: t('earn.invalid_code') };
    if (date !== today) return { valid: false, error: t('earn.invalid_code') };
    if (!vPart.startsWith('v') || isNaN(parseInt(vPart.slice(1)))) return { valid: false, error: t('earn.invalid_code') };
    const num = parseInt(vPart.slice(1));
    if (num < 1 || num > 7) return { valid: false, error: t('earn.invalid_code') };
    const claimKey = vPart;
    if (state.claim_codes_used.includes(claimKey)) return { valid: false, error: t('earn.code_used') };
    return { valid: true, claimNum: claimKey };
  };

  const handleClaimSubmit = async () => {
    setClaimError('');
    const result = validateClaimCode(claimCode);
    if (!result.valid) {
      setClaimError(result.error ?? t('earn.invalid_code'));
      return;
    }
    setClaimLoading(true);
    // Show OnClickA ad via window.initCdTma
    try {
      if (window.initCdTma) {
        const show = await window.initCdTma({ id: parseInt(import.meta.env.VITE_ONCLICKA_SPOT_ID ?? '6116695') });
        await show();
      } else {
        await new Promise(r => setTimeout(r, 500));
      }
    } catch { /* ad failed, still reward */ }

    const newCodes = [...state.claim_codes_used, result.claimNum!];
    await updateState({
      total_points: state.total_points + 3000,
      claim_codes_used: newCodes,
    });
    playCoin();
    setReward({ amount: 3000 });
    setShowClaim(false);
    setClaimCode('');
    setClaimLoading(false);
  };

  const handleSocialTask = (type: 'youtube' | 'tiktok') => {
    playClick();
    const url = type === 'youtube'
      ? 'https://www.youtube.com/@censorcoin'
      : 'https://www.tiktok.com/@censorcoin';
    window.open(url, '_blank');
    window.Telegram?.WebApp?.openLink(url);

    setSocialTimer({ type, seconds: 120 });
    socialTimerRef.current = setInterval(() => {
      setSocialTimer((prev) => {
        if (!prev) return null;
        if (prev.seconds <= 1) {
          clearInterval(socialTimerRef.current!);
          // Award coins after timer
          const field = type === 'youtube' ? 'youtube_task_completed' : 'tiktok_task_completed';
          updateState({
            total_points: state.total_points + 10000,
            [field]: true,
          } as Partial<typeof state>);
          playCoin();
          setReward({ amount: 10000 });
          return null;
        }
        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#0d1033] to-[#0a0a1a] pb-24">
      <AnimatePresence>
        {reward && (
          <RewardOverlay amount={reward.amount} onDone={() => setReward(null)} />
        )}
      </AnimatePresence>

      <div className="px-5 pt-6 pb-2">
        <h1 className="text-white text-2xl font-bold">{t('earn.title')}</h1>
      </div>

      {/* Daily Censoring */}
      <section className="px-5 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-yellow-400 rounded-full" />
          <h2 className="text-white font-semibold text-base">{t('earn.daily_censoring')}</h2>
          <span className="ml-auto text-zinc-400 text-sm">{completedTasks}/6</span>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => {
            const done = completedTasks > i;
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleTaskClick(i)}
                disabled={done}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  done
                    ? 'bg-green-500/10 border-green-500/30 opacity-70'
                    : 'bg-zinc-800/60 border-zinc-700/40 hover:border-yellow-400/40 hover:bg-zinc-700/60'
                }`}
              >
                <img
                  src={TASK_ILLUSTRATIONS[i]}
                  alt=""
                  className="w-10 h-10 object-contain rounded-lg"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/6941/6941697.png'; }}
                />
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">{t('earn.task')} #{i + 1}</p>
                  <p className="text-zinc-400 text-xs">+5,000 coins</p>
                </div>
                {done ? (
                  <CheckCircle weight="thin" size={22} className="text-green-400 flex-shrink-0" />
                ) : (
                  <Play weight="thin" size={18} className="text-yellow-400 flex-shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Censor Claim */}
      <section className="px-5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-purple-400 rounded-full" />
          <h2 className="text-white font-semibold text-base">{t('earn.censor_claim')}</h2>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { playClick(); setShowClaim(true); setClaimError(''); setClaimCode(''); }}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:border-purple-400/60 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Tag weight="thin" size={26} className="text-purple-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-semibold">{t('earn.censor_claim')}</p>
            <p className="text-zinc-400 text-sm">{t('earn.claim_progress', { done: claimsUsed })}</p>
          </div>
          <Progress value={(claimsUsed / 7) * 100} className="w-16 h-2" />
        </motion.button>
      </section>

      {/* Social Tasks */}
      <section className="px-5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-red-400 rounded-full" />
          <h2 className="text-white font-semibold text-base">{t('earn.social_tasks')}</h2>
        </div>
        <div className="space-y-2">
          {/* YouTube */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => !state.youtube_task_completed && handleSocialTask('youtube')}
            disabled={state.youtube_task_completed}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
              state.youtube_task_completed
                ? 'bg-green-500/10 border-green-500/30 opacity-70'
                : socialTimer?.type === 'youtube'
                  ? 'bg-red-500/10 border-red-500/40 animate-pulse'
                  : 'bg-zinc-800/60 border-zinc-700/40 hover:border-red-400/40'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <YoutubeLogo weight="thin" size={24} className="text-red-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium">{t('earn.youtube_task')}</p>
              <p className="text-zinc-400 text-xs">
                {state.youtube_task_completed
                  ? t('earn.completed')
                  : socialTimer?.type === 'youtube'
                    ? t('earn.wait_timer', { seconds: socialTimer.seconds })
                    : '+10,000 coins'}
              </p>
            </div>
            {state.youtube_task_completed && <SealCheck weight="thin" size={22} className="text-green-400" />}
          </motion.button>

          {/* TikTok */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => !state.tiktok_task_completed && handleSocialTask('tiktok')}
            disabled={state.tiktok_task_completed}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
              state.tiktok_task_completed
                ? 'bg-green-500/10 border-green-500/30 opacity-70'
                : socialTimer?.type === 'tiktok'
                  ? 'bg-zinc-500/10 border-zinc-500/40 animate-pulse'
                  : 'bg-zinc-800/60 border-zinc-700/40 hover:border-zinc-400/40'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-500/20 flex items-center justify-center">
              <TiktokLogo weight="thin" size={24} className="text-zinc-300" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium">{t('earn.tiktok_task')}</p>
              <p className="text-zinc-400 text-xs">
                {state.tiktok_task_completed
                  ? t('earn.completed')
                  : socialTimer?.type === 'tiktok'
                    ? t('earn.wait_timer', { seconds: socialTimer.seconds })
                    : '+10,000 coins'}
              </p>
            </div>
            {state.tiktok_task_completed && <SealCheck weight="thin" size={22} className="text-green-400" />}
          </motion.button>
        </div>
      </section>

      {/* Task Review Modal */}
      <Dialog open={activeTask !== null} onOpenChange={() => setActiveTask(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{t('earn.review_content')}</DialogTitle>
          </DialogHeader>
          {activeTask !== null && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((imgI) => (
                  <img
                    key={imgI}
                    src={`https://picsum.photos/400/600?random=${(activeTask * 3) + imgI + 10}`}
                    alt=""
                    className="w-full aspect-[2/3] object-cover rounded-lg"
                  />
                ))}
              </div>
              <div>
                <p className="text-zinc-400 text-xs mb-2">{t('earn.is_violent')}</p>
                <div className="flex gap-2">
                  {['Yes', 'No'].map((v) => (
                    <button
                      key={v}
                      onClick={() => { playClick(); setTaskAnswer1(v); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        taskAnswer1 === v
                          ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-zinc-400 text-xs mb-2">{t('earn.is_clear')}</p>
                <div className="flex gap-2">
                  {['Yes', 'No'].map((v) => (
                    <button
                      key={v}
                      onClick={() => { playClick(); setTaskAnswer2(v); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        taskAnswer2 === v
                          ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleSubmitTask}
                disabled={!taskAnswer1 || !taskAnswer2 || adLoading}
                className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-900 font-bold hover:from-yellow-300 hover:to-amber-400"
              >
                {adLoading ? t('earn.watching_ad') : t('earn.submit_review')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Claim Code Modal */}
      <Dialog open={showClaim} onOpenChange={setShowClaim}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{t('earn.claim_title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
              <p className="text-purple-300 text-sm font-medium">{t('earn.claim_progress', { done: claimsUsed })}</p>
              <Progress value={(claimsUsed / 7) * 100} className="mt-2 h-2" />
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-3">
              <p className="text-zinc-400 text-xs mb-1">Code Format:</p>
              <p className="text-zinc-300 text-xs font-mono">[Prefix]-[YYYYMMDD]-v[1-7]</p>
              <p className="text-zinc-500 text-xs mt-1">e.g. S9t-20260418-v1</p>
            </div>
            <Input
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value)}
              placeholder={t('earn.enter_code')}
              className="bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500"
            />
            {claimError && (
              <p className="text-red-400 text-sm text-center">{claimError}</p>
            )}
            <Button
              onClick={handleClaimSubmit}
              disabled={!claimCode.trim() || claimLoading || claimsUsed >= 7}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold hover:from-purple-400 hover:to-violet-500"
            >
              {claimLoading ? t('earn.watching_ad') : t('earn.validate_claim')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
