self.addEventListener('push', function(event) {
  let data = {};
  try { data = event.data.json(); } catch(e) {}
  const title = data.title || 'Νέα ειδοποίηση';
  const body = data.body || '';
  const icon = data.icon || '/assets/logo.png';

  event.waitUntil(
    self.registration.showNotification(title, {
      body, icon, badge: icon, data
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = '/waiter';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
