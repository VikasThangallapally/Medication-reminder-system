import { useEffect, useState } from 'react';

export default function InstallAppButton({ variant = 'floating' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(isInstalled);

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    };
  }, []);

  const onInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (isStandalone || !deferredPrompt) {
    return null;
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={onInstallClick}
        className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-5 py-3.5 text-base font-extrabold text-slate-950 shadow-xl shadow-cyan-900/40 transition hover:from-cyan-400 hover:to-emerald-400"
        aria-label="Download app"
      >
        Download App
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onInstallClick}
      className="install-fab"
      aria-label="Download app"
    >
      <span className="install-fab__title">Download App</span>
      <span className="install-fab__subtitle">Install on mobile or laptop</span>
    </button>
  );
}
