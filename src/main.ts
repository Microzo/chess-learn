import './ui/styles/main.css';
import { go, mount } from './app/router';
import { homeScreen } from './ui/screens/home';

mount(document.getElementById('app')!);
go(homeScreen);

// Service worker hanya di build produksi (di dev akan mengganggu hot reload).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('SW gagal:', e));
  });
}
