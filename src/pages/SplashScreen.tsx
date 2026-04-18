import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/verify', { replace: true });
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a1a] via-[#0d1033] to-[#0a0a1a]">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-28 h-28 rounded-full border-4 border-yellow-400/30 border-t-yellow-400"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/6941/6941697.png"
              alt="Censor Coin"
              className="w-16 h-16 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 uppercase">
            CENSOR COIN
          </h1>
          <p className="text-zinc-400 text-sm mt-1 tracking-wider">Earn. Censor. Grow.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-1.5 mt-4"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-yellow-400"
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
