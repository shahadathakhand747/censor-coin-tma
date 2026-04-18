import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Users, CheckSquare, Tag, Coins } from '@phosphor-icons/react';
import { useUser } from '../context/UserContext';

// Lottie animation will be loaded dynamically

const statCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 + 0.2 } }),
};

export default function HomePage() {
  const { t } = useTranslation();
  const { state } = useUser();

  if (!state) return null;

  const stats = [
    {
      label: t('home.stats.total_refers'),
      value: state.total_refers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10',
    },
    {
      label: t('home.stats.tasks_today'),
      value: `${state.today_tasks_completed}/6`,
      icon: CheckSquare,
      color: 'from-green-500 to-emerald-600',
      bg: 'bg-green-500/10',
    },
    {
      label: t('home.stats.claims_today'),
      value: `${state.claim_codes_used.length}/7`,
      icon: Tag,
      color: 'from-purple-500 to-violet-600',
      bg: 'bg-purple-500/10',
    },
    {
      label: t('home.stats.claim_codes'),
      value: state.claim_codes_used.length,
      icon: Coins,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#0d1033] to-[#0a0a1a] pb-24">
      {/* Header */}
      <div className="pt-6 pb-2 px-5">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-zinc-400 text-sm">{t('home.welcome')},</p>
            <h1 className="text-white text-xl font-bold truncate max-w-[200px]">
              {state.first_name || state.username || 'Censor'}
            </h1>
          </div>
          <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-2xl px-4 py-2 text-right">
            <p className="text-zinc-400 text-[10px] uppercase tracking-widest">{t('home.total_points')}</p>
            <p className="text-yellow-400 font-bold text-lg leading-tight">
              {state.total_points.toLocaleString()}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Hero section with Lottie */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="relative mx-5 mt-4 rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border border-zinc-700/30 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-white font-bold text-xl leading-tight">Censor Coin</h2>
            <p className="text-zinc-400 text-sm mt-1">Earn by censoring content daily</p>
            <div className="flex items-center gap-1.5 mt-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-medium">Live Rewards</span>
            </div>
          </div>
          <div className="w-28 h-28 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center animate-pulse">
              <img
                src="https://cdn-icons-png.flaticon.com/512/6941/6941697.png"
                alt="coin"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Illustration */}
      <div className="mx-5 mt-3 flex justify-center">
        <motion.img
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          src="https://cdn3d.iconscout.com/3d/premium/thumb/bitcoin-3d-icon-download-in-png-blend-fbx-gltf-file-formats--cryptocurrency-crypto-coin-currency-pack-network-communication-icons-4965806.png"
          alt="Censor Coin"
          className="w-44 h-44 object-contain drop-shadow-2xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/6941/6941697.png';
          }}
        />
      </div>

      {/* Stats Grid */}
      <div className="px-5 mt-2 grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={statCardVariants}
            className={`${stat.bg} border border-zinc-700/30 rounded-2xl p-4`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-zinc-400 text-xs mb-1">{stat.label}</p>
                <p className="text-white font-bold text-2xl leading-tight">{stat.value}</p>
              </div>
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon weight="thin" size={18} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
