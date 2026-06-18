const CACHE_NAME = 'neo-cache-v1';
const assetsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png'
];

// تثبيت السيرفيس وركر وحفظ الملفات في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

// استدعاء الملفات من الكاش عند عدم وجود إنترنت
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});