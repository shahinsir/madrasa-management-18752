const CACHE_NAME = 'madrasa-management-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.log('Cache addAll failed:', error);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  // শুধু GET রিকুয়েস্ট ক্যাচ করবো
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // ক্যাশে থেকে ডাটা পাওয়া গেলে রিটার্ন করো
        if (response) {
          return response;
        }

        // নেটওয়ার্ক থেকে ফেচ করো
        return fetch(event.request)
          .then(response => {
            // ভ্যালিড রেস্পন্স না হলে রিটার্ন করো
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // ক্যাশে সেভ করো
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // নেটওয়ার্ক ফেইল করলে fallback দেখাও
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
