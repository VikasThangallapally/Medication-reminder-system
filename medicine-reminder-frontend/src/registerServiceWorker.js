export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  let refreshing = false;
  let updateTimer = null;
  const base = import.meta.env.BASE_URL || '/';
  const workerUrl = `${base.replace(/\/$/, '')}/serviceWorker.js`;

  const triggerUpdate = (registration) => {
    if (!registration) {
      return;
    }

    registration.update().catch(() => {});

    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(workerUrl, { updateViaCache: 'none' })
      .then((registration) => {
        console.info('[SW] Registered', workerUrl);
        triggerUpdate(registration);

        // Keep installed PWAs fresh while open.
        updateTimer = window.setInterval(() => {
          triggerUpdate(registration);
        }, 60 * 1000);

        const onFocusOrVisible = () => {
          if (document.visibilityState === 'visible') {
            triggerUpdate(registration);
          }
        };

        window.addEventListener('focus', onFocusOrVisible);
        document.addEventListener('visibilitychange', onFocusOrVisible);

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

    window.addEventListener('beforeunload', () => {
      if (updateTimer) {
        window.clearInterval(updateTimer);
      }
    });
  });
}