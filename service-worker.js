// Nome base do cache e versão automática
const CACHE_BASE = 'js-pwa-cache';
const CACHE_VERSION = Date.now(); // timestamp único a cada deploy
const CACHE_NAME = `${CACHE_BASE}-${CACHE_VERSION}`;

// Lista de arquivos essenciais a cachear
const URLS_TO_CACHE = [
  '/js-pwa/index.html',
  '/js-pwa/manifest.json',
  '/js-pwa/icon-192.png',
  '/js-pwa/icon-512.png'
];

// 🔹 Instalação: cache inicial
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache adicionado com sucesso:', CACHE_NAME);
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting(); // ativa imediatamente
});

// 🔹 Ativação: remove caches antigos automaticamente
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => !key.startsWith(CACHE_BASE + '-')) // mantém só o atual
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // controla imediatamente todas as páginas
});

// 🔹 Intercepta requisições: serve cache ou busca online
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response; // retorna do cache se existir
        return fetch(event.request)
          .then(fetchResponse => {
            // Atualiza cache com resposta nova
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          })
          .catch(() => {
            // Fallback offline simples
            if (event.request.destination === 'document') {
              return caches.match('/js-pwa/index.html');
            }
          });
      })
  );
});




