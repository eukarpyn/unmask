// unmask — service worker (v8 · 10 nov 2026)
// Estratégia: rede primeiro (sempre pega a versão mais nova do site) e cache só como reserva offline.
const CACHE = 'unmask-v8';
const CORE = ['./', 'index.html', 'cards.json', 'manifest.json', 'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // ativa a versão nova sem esperar fechar o app
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' }))))
      .catch(() => {})
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req.url, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req.url, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req.url, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html'))
      )
  );
});
