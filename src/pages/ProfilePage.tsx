import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  User, Copy, Check, PencilSimple, Globe, YoutubeLogo, Lock, CurrencyCircleDollar,
  FileText, ShieldCheck, ArrowSquareOut
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useUser } from '../context/UserContext';
import { useTelegram } from '../hooks/useTelegram';
import { getDailyReferralCount } from '../utils/api';
import { getTodayDhaka } from '../utils/date';
import { useToast } from '@/hooks/use-toast';
import i18n from '../i18n';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
] as const;

function maskAddress(addr: string): string {
  if (!addr) return '';
  if (addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const { state, updateState } = useUser();
  const { user } = useTelegram();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showTon, setShowTon] = useState(false);
  const [tonInput, setTonInput] = useState('');

  // Fetch referral count once per day
  useEffect(() => {
    if (!state || !user) return;
    const today = getTodayDhaka();
    if (state.last_referral_check_date === today) return;

    getDailyReferralCount(user.id).then((count) => {
      if (count > state.total_refers) {
        const newPoints = state.total_points + (count - state.total_refers) * 6000;
        updateState({
          total_refers: count,
          total_points: newPoints,
          last_referral_check_date: today,
        });
        toast({ title: t('profile.referral_updated') });
      } else {
        updateState({ last_referral_check_date: today });
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!state) return null;

  const referralLink = `https://t.me/Censorcoin_bot?start=${state.referral_code}`;
  const coinsFromReferrals = state.total_refers * 6000;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleLangSelect = async (lang: typeof LANGUAGES[number]['code']) => {
    await updateState({ language: lang });
    i18n.changeLanguage(lang);
    setShowLang(false);
  };

  const canChangeTon = (): boolean => {
    if (!state.last_ton_address_change) return true;
    const last = new Date(state.last_ton_address_change);
    const diff = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 14;
  };

  const daysUntilTonChange = (): number => {
    if (!state.last_ton_address_change) return 0;
    const last = new Date(state.last_ton_address_change);
    const diff = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
    return Math.ceil(14 - diff);
  };

  const handleSaveTon = async () => {
    if (!tonInput.trim()) return;
    if (!canChangeTon()) return;
    await updateState({
      ton_address: tonInput.trim(),
      last_ton_address_change: new Date().toISOString(),
    });
    toast({ title: t('profile.ton_address_saved') });
    setShowTon(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === state.language);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#0d1033] to-[#0a0a1a] pb-28">
      <div className="px-5 pt-6">
        <h1 className="text-white text-2xl font-bold mb-5">{t('profile.title')}</h1>

        {/* Profile Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-zinc-900/80 border border-zinc-700/50 rounded-2xl p-5 flex items-center gap-4 mb-4"
        >
          <Avatar className="w-16 h-16 border-2 border-yellow-400/50">
            <AvatarImage src={state.profile_photo_url ?? undefined} alt={state.first_name} />
            <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-amber-600 text-zinc-900 font-bold text-xl">
              {state.first_name?.[0]?.toUpperCase() ?? 'C'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-lg truncate">{state.first_name || 'Censor User'}</p>
            {state.username && (
              <p className="text-zinc-400 text-sm truncate">@{state.username}</p>
            )}
            {state.ton_address && (
              <div className="flex items-center gap-1 mt-1">
                <Lock weight="thin" size={12} className="text-zinc-500 flex-shrink-0" />
                <span className="text-zinc-500 text-xs font-mono">{maskAddress(state.ton_address)}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-yellow-400 font-bold text-xl">{state.total_points.toLocaleString()}</p>
            <p className="text-zinc-500 text-xs">{t('common.coins')}</p>
          </div>
        </motion.div>

        {/* Language */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          onClick={() => setShowLang(true)}
          className="w-full bg-zinc-900/80 border border-zinc-700/50 rounded-2xl p-4 flex items-center gap-3 mb-3 hover:border-zinc-500/70 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Globe weight="thin" size={22} className="text-blue-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white text-sm font-medium">{t('profile.language')}</p>
            <p className="text-zinc-400 text-xs">{currentLang?.flag} {currentLang?.name}</p>
          </div>
          <ArrowSquareOut weight="thin" size={16} className="text-zinc-500" />
        </motion.button>

        {/* Tutorial */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => window.open('https://www.youtube.com/@censorcoin', '_blank')}
          className="w-full bg-zinc-900/80 border border-zinc-700/50 rounded-2xl p-4 flex items-center gap-3 mb-3 hover:border-red-500/30 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <YoutubeLogo weight="thin" size={22} className="text-red-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white text-sm font-medium">{t('profile.tutorial')}</p>
            <p className="text-zinc-400 text-xs">{t('profile.watch_tutorial')}</p>
          </div>
          <ArrowSquareOut weight="thin" size={16} className="text-zinc-500" />
        </motion.button>

        {/* TON Address */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          onClick={() => { if (canChangeTon()) { setTonInput(state.ton_address); setShowTon(true); } }}
          className="w-full bg-zinc-900/80 border border-zinc-700/50 rounded-2xl p-4 flex items-center gap-3 mb-4 hover:border-cyan-500/30 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Lock weight="thin" size={22} className="text-cyan-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white text-sm font-medium">{t('profile.ton_address')}</p>
            <p className="text-zinc-400 text-xs">
              {state.ton_address
                ? maskAddress(state.ton_address)
                : canChangeTon()
                  ? t('profile.masked_address')
                  : t('profile.address_cooldown', { days: daysUntilTonChange() })}
            </p>
          </div>
          {canChangeTon() && <PencilSimple weight="thin" size={16} className="text-zinc-500" />}
        </motion.button>

        <Separator className="bg-zinc-700/50 mb-4" />

        {/* Referral Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/80 border border-zinc-700/50 rounded-2xl p-4 mb-3"
        >
          <div className="flex items-center gap-2 mb-3">
            <User weight="thin" size={18} className="text-yellow-400" />
            <p className="text-white font-semibold">{t('profile.referral')}</p>
          </div>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2">
              <p className="text-zinc-300 text-xs truncate font-mono">{referralLink}</p>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center hover:bg-yellow-400/30 transition-all"
            >
              {copied ? <Check weight="thin" size={18} className="text-green-400" /> : <Copy weight="thin" size={18} className="text-yellow-400" />}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-xl">{state.total_refers}</p>
              <p className="text-zinc-400 text-xs">{t('profile.total_refers')}</p>
            </div>
            <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
              <p className="text-yellow-400 font-bold text-xl">{coinsFromReferrals.toLocaleString()}</p>
              <p className="text-zinc-400 text-xs">{t('profile.coins_earned')}</p>
            </div>
          </div>
        </motion.div>

        {/* Legal links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-zinc-900/80 border border-zinc-700/50 rounded-2xl overflow-hidden mb-4"
        >
          <button
            onClick={() => window.open('https://t.me/censorcoin', '_blank')}
            className="w-full flex items-center gap-3 p-4 hover:bg-zinc-800/50 transition-all"
          >
            <ShieldCheck weight="thin" size={20} className="text-zinc-400" />
            <span className="text-zinc-300 text-sm flex-1 text-left">{t('profile.privacy')}</span>
            <ArrowSquareOut weight="thin" size={14} className="text-zinc-500" />
          </button>
          <Separator className="bg-zinc-700/40" />
          <button
            onClick={() => window.open('https://t.me/censorcoin', '_blank')}
            className="w-full flex items-center gap-3 p-4 hover:bg-zinc-800/50 transition-all"
          >
            <FileText weight="thin" size={20} className="text-zinc-400" />
            <span className="text-zinc-300 text-sm flex-1 text-left">{t('profile.terms')}</span>
            <ArrowSquareOut weight="thin" size={14} className="text-zinc-500" />
          </button>
        </motion.div>
      </div>

      {/* Language Modal */}
      <Dialog open={showLang} onOpenChange={setShowLang}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-xs mx-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{t('profile.select_language')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLangSelect(lang.code)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  state.language === lang.code
                    ? 'bg-yellow-400/10 border-yellow-400/50 text-yellow-400'
                    : 'bg-zinc-800/60 border-zinc-700/40 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
                {state.language === lang.code && <Check weight="thin" size={18} className="ml-auto" />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* TON Address Modal */}
      <Dialog open={showTon} onOpenChange={setShowTon}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-xs mx-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{t('profile.edit_address')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={tonInput}
              onChange={(e) => setTonInput(e.target.value)}
              placeholder={t('profile.address_placeholder')}
              className="bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500 font-mono text-sm"
            />
            <p className="text-zinc-500 text-xs">14-day cooldown after saving</p>
            <Button
              onClick={handleSaveTon}
              disabled={!tonInput.trim()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:from-cyan-400 hover:to-blue-500"
            >
              {t('profile.save_address')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
