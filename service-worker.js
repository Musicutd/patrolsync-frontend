const CACHE_NAME = 'patrolsync-guard-v1';
const CORE = ['./guard.html','./offline.html','./manifest.webmanifest','./patrolsync-icon.svg'];
const FIELD_PAGES = ['./my_shifts.html','./my_timesheets.html','./availability.html','./shift_marketplace.html','./my_patrols.html','./handover.html','./my_notifications.html','./team_messages.html','./my_safety.html','./my_dispatches.html'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(async cache => {
    for (const url of [...CORE,...FIELD_PAGES]) {
      try { await cache.add(url); } catch (err) { /* Optional page may not yet be deployed. */ }
    }
  }).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME && key.startsWith('patrolsync-guard-')).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.hostname === 'patrolsync-backend.onrender.com' || url.pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok && url.origin === self.location.origin) caches.open(CACHE_NAME).then(cache => cache.put(request,response.clone()));
      return response;
    }).catch(async () => (await caches.match(request)) || caches.match('./offline.html')));
    return;
  }
  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request,response.clone()));
      return response;
    })));
  }
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
