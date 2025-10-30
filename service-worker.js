// 🔹 Nome do cache e versão manual (aumente quando fizer deploy)
const CACHE_VERSION = '1.0.2'; // mesma versão do index.html
const CACHE_NAME = `js-pwa-cache-${CACHE_VERSION}`;

// 🔹 Arquivos essenciais a cachear
const URLS_TO_CACHE = [
  '/js-pwa/index.html',
  '/js-pwa/manifest.json',
  '/js-pwa/icon-192.png',
  '/js-pwa/icon-512.png',
  '/js-pwa/styles.css',
  '/js-pwa/script.js'
];

// ---------------- Install: cache inicial ----------------
self.addEventListener('install', event => {
  console.log('🔹 [SW] Instalando e cacheando arquivos...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting(); // ativa imediatamente
});

// ---------------- Activate: remove caches antigos e envia versão ----------------
self.addEventListener('activate', event => {
  console.log('🔹 [SW] Ativando e limpando caches antigos...');
  event.waitUntil((async () => {
    // Remove caches antigos
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    );

    // Assume controle imediatamente
    await self.clients.claim();

    // Envia a versão atual aos clientes abertos
    const clientsList = await self.clients.matchAll();
    for (const client of clientsList) {
      client.postMessage({
        type: 'version',
        version: CACHE_VERSION
      });
    }

    console.log(`🔹 [SW] Versão ${CACHE_VERSION} enviada aos clientes.`);
  })());
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
