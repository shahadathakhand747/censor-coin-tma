import { createRoot } from 'react-dom/client';
import { init } from '@telegram-apps/sdk-react';
import App from './App';
import './index.css';
import './i18n';

try {
  init();
} catch {
  // Not in Telegram environment, continue anyway for dev
}

createRoot(document.getElementById('root')!).render(<App />);
