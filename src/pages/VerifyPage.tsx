import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, TelegramLogo } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useUser } from '../context/UserContext';
import { useTelegram } from '../hooks/useTelegram';
import { verifyMembership, registerUser } from '../utils/api';
import { generateReferralCode } from '../utils/referralCode';
import { getTodayDhaka } from '../utils/date';
import { useToast } from '@/hooks/use-toast';

export default function VerifyPage() {
  const { t } = useTranslation();
  const { state, updateState } = useUser();
  const { user, startParam } = useTelegram();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(false);

  // Already verified
  if (state?.membership_verified) {
    navigate('/home', { replace: true });
    return null;
  }

  const handleJoin = () => {
    window.Telegram?.WebApp?.openTelegramLink('https://t.me/censorcoin');
    window.open('https://t.me/censorcoin', '_blank');
  };

  const handleVerify = async () => {
    if (!user) return;
    setVerifying(true);
    try {
      const isMember = await verifyMembership(user.id);
      if (!isMember) {
        toast({ title: t('verify.not_member'), variant: 'destructive' });
        setVerifying(false);
        return;
      }

      // Register if not already
      let referralCode = state?.referral_code ?? generateReferralCode(user.id);
      if (state?.reg_status !== 'registered') {
        const result = await registerUser({
          telegram_id: user.id,
          username: user.username ?? '',
          first_name: user.first_name ?? '',
          referral_code_used: startParam ?? '',
        });
        if (result.referral_code) {
          referralCode = result.referral_code;
        }
      }

      await updateState({
        membership_verified: true,
        reg_status: 'registered',
        referral_code: referralCode,
        username: user.username ?? state?.username ?? '',
        first_name: user.first_name ?? state?.first_name ?? '',
        profile_photo_url: user.photo_url ?? state?.profile_photo_url ?? null,
        last_referral_check_date: getTodayDhaka(),
      });

      toast({ title: t('verify.success') });
      navigate('/home', { replace: true });
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a1a] via-[#0d1033] to-[#0a0a1a] p-6">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="bg-zinc-900/80 border border-zinc-700/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <ShieldCheck weight="thin" size={40} className="text-zinc-900" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-2">{t('verify.title')}</h1>
              <p className="text-zinc-400 text-sm leading-relaxed">{t('verify.description')}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleJoin}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold rounded-xl border-0 gap-2"
            >
              <TelegramLogo weight="thin" size={20} />
              {t('verify.join')}
            </Button>

            <Button
              onClick={handleVerify}
              disabled={verifying}
              className="w-full h-12 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-zinc-900 font-bold rounded-xl border-0"
            >
              {verifying ? t('verify.verifying') : t('verify.verify')}
            </Button>
          </div>

          <p className="text-center text-zinc-500 text-xs mt-6">
            Powered by Telegram Mini Apps
          </p>
        </div>
      </motion.div>
    </div>
  );
}
