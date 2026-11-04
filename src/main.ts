import './ui/styles/main.css';
import { watchUpdates } from './app/update';
import { go, mount } from './app/router';
import { applySettings } from './core/settings';
import { homeScreen } from './ui/screens/home';

applySettings();
mount(document.getElementById('app')!);
go(homeScreen);

// Service worker hanya di build produksi (di dev akan mengganggu hot reload).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(() => watchUpdates()).catch((e) => console.warn('SW gagal:', e));
  });
}
