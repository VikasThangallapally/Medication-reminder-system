const CACHE_NAME = 'medicine-reminder-v2';
const urlsToCache = [
  '/',
  '/dashboard',
  '/analytics',
  '/caregiver',
  '/index.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Allow the page to trigger immediate activation for updated workers.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event - prefer network for fresh UI, fallback to cache when offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Skip CORS requests and API calls - always use network
  if (event.request.url.includes('/api/') || event.request.url.includes('onrender.com')) {
    return;
  }

  // Keep navigation requests fresh so app updates are visible immediately.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put('/index.html', responseToCache);
          });
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/index.html');
          return cached || Response.error();
        })
    );
    return;
  }

  // Serve cached static files first for quick mobile app load.
  if (/\.(?:js|css|png|jpg|jpeg|svg|webp|json)$/i.test(requestUrl.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(event.request).then((response) => {
          if (
            response &&
            response.status === 200 &&
            response.type !== 'error' &&
            requestUrl.origin === self.location.origin
          ) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (
          response &&
          response.status === 200 &&
          response.type !== 'error' &&
          requestUrl.origin === self.location.origin
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) {
          return cached;
        }

        return caches.match('/index.html');
      })
  );
});

self.addEventListener('push', (event) => {
  const fallback = {
    title: 'Medicine Reminder',
    body: 'It is time to take your medicine.',
    tag: 'medicine-reminder',
    data: {
      url: '/dashboard',
    },
  };

  const payload = (() => {
    try {
      return event.data ? event.data.json() : fallback;
    } catch {
      return fallback;
    }
  })();

  event.waitUntil(
    self.registration.showNotification(payload.title || fallback.title, {
      body: payload.body || fallback.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: payload.tag || fallback.tag,
      renotify: true,
      data: payload.data || fallback.data,
      requireInteraction: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetPath = event.notification?.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(targetPath);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetPath);
      }

      return null;
    })
  );
});
