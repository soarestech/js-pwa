const CACHE_NAME = 'meu-pwa-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instala o service worker e armazena os arquivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Arquivos armazenados no cache!');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Ativa o service worker
self.addEventListener('activate', event => {
  console.log('✅ Service Worker ativado!');
});

// Intercepta requisições e usa o cache offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
