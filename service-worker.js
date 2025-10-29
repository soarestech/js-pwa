// 🔹 Nome do cache e versão manual (aumente quando fizer deploy)
const CACHE_VERSION = '1.0.2'; // mesma versão do index.html
const CACHE_NAME = `js-pwa-cache-${CACHE_VERSION}`;

// 🔹 Arquivos essenciais a cachear
const URLS_TO_CACHE = [
  '/js-pwa/index.html',
  '/js-pwa/manifest.json',
  '/js-pwa/icon-192.png',
  '/js-pwa/icon-512.png'
];

// ---------------- Install: cache inicial ----------------
self.addEventListener('install', event => {
  console.log('🔹 Service Worker: Instalando e cacheando arquivos...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting(); // ativa imediatamente
});

// ---------------- Activate: remove caches antigos ----------------
self.addEventListener('activate', event => {
  console.log('🔹 Service Worker: Ativando e limpando caches antigos...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME) // remove caches que não são a versão atual
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // assume controle imediatamente
});

// ---------------- Fetch: intercepta requisições ----------------
self.addEventListener('fetch', event => {
  const requestURL = new URL(event.request.url);

  // Intercepta apenas requisições dentro do PWA
  if (!requestURL.pathname.startsWith('/js-pwa/')) return;

  // Estratégia: Network first para HTML, Cache first para outros assets
  if (requestURL.pathname.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Atualiza cache com a versão nova
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request).then(fetchResponse => {
          // Atualiza cache com a resposta nova
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        }))
        .catch(() => {
          // fallback simples offline
          if (event.request.destination === 'document') {
            return caches.match('/js-pwa/index.html');
          }
        })
    );
  }
});



