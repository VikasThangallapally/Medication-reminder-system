export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  let refreshing = false;
  const base = import.meta.env.BASE_URL || '/';
  const workerUrl = `${base.replace(/\/$/, '')}/serviceWorker.js`;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(workerUrl)
      .then((registration) => {
        console.info('[SW] Registered', workerUrl);
        registration.update().catch(() => {});

        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) {
            return;
          }

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch((error) => {
        console.warn('Service worker registration failed:', error);
      });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) {
        return;
      }
      refreshing = true;
      window.location.reload();
    });
  });
}