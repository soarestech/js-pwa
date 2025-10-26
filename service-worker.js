const CACHE_NAME = 'js-pwa-v1'; // Atualize a versão quando mudar algo
const FILES_TO_CACHE = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Instalando o Service Worker e cacheando arquivos
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Cacheando arquivos...');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting(); // força o SW a ativar imediatamente
});

// Ativando o Service Worker e limpando caches antigos
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Ativando...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Limpando cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // controla imediatamente todas as abas abertas
});

// Interceptando requisições e servindo do cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});



