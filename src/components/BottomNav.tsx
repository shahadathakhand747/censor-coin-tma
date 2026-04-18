import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { House, CurrencyCircleDollar, User } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/home', icon: House, key: 'nav.home' },
  { path: '/earn', icon: CurrencyCircleDollar, key: 'nav.earn' },
  { path: '/profile', icon: User, key: 'nav.profile' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-zinc-900/95 backdrop-blur-md border-t border-zinc-700/50 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
          {tabs.map(({ path, icon: Icon, key }) => {
            const isActive = pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-0.5 flex-1 py-2 px-3 rounded-xl relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-yellow-400/10 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon
                  weight="thin"
                  size={26}
                  className={isActive ? 'text-yellow-400' : 'text-zinc-400'}
                />
                <span className={`text-[10px] font-medium ${isActive ? 'text-yellow-400' : 'text-zinc-500'}`}>
                  {t(key)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
