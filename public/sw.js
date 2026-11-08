// Dastiyab Store Service Worker - Retargeting & Push Notifications
const SW_VERSION = 'dastiyab-sw-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push notifications
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Dastiyab Store — Jo Chahiye, Wahi Dastiyab',
        body: event.data.text()
      };
    }
  }

  const title = data.title || 'Dastiyab Store — Jo Chahiye, Wahi Dastiyab';
  const options = {
    body: data.body || 'Check out our latest trending products with Cash on Delivery!',
    icon: data.icon || '/icon.png',
    badge: data.badge || '/icon.png',
    image: data.image || undefined,
    tag: data.tag || 'dastiyab-retargeting',
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/shop',
      dateOfArrival: Date.now()
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle Notification Clicks (Navigates visitor to target store page)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/shop';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus and navigate it
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Allow client pages to request notifications directly through the Service Worker
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(
        title || 'Dastiyab Store',
        {
          icon: '/icon.png',
          badge: '/icon.png',
          vibrate: [150, 80, 150],
          ...options
        }
      )
    );
  }
});

